import express, { Request, Response } from 'express';
import fs from 'fs';
import cors from 'cors';
import { randomUUID } from 'crypto';

const app = express();
const port = 3005;

let icon: Buffer | null = null;
let notFound: Buffer | null = null;
try {
  icon = fs.readFileSync("assets/computer_monitor_18859.ico");
  notFound = fs.readFileSync("src/PageNotFound.html");
} catch (err) {
  console.log("Server unable to load required asset files. =(");
  console.error(err);
}

interface Pet {
  id: string;
  name: string;
  owner: string;
  imageUrl?: string;
  favoriteFood?: string;
  isFed: boolean;
  dateAdded: Date;
}

const pets: Pet[] = [
  {
    id: '1',
    name: 'Buddy',
    owner: 'Alice',
    imageUrl: 'https://example.com/buddy.jpg',
    favoriteFood: 'Carrots',
    isFed: true,
    dateAdded: new Date('2023-01-01'),
  },
  {
    id: '2',
    name: 'Mittens',
    owner: 'Bob',
    isFed: false,
    dateAdded: new Date('2023-01-02'),
  },
];

// Define CORS options (optional, but recommended for production)
const corsOptions = {
  origin: '*', // Allow all origins (not recommended for production)
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true, // Allow cookies and authorization headers
  allowedHeaders: 'Content-Type, Authorization, ngrok-skip-browser-warning', // Include ngrok-skip-browser-warning
};

// Enable CORS middleware with options
app.use(cors(corsOptions));
app.use(express.json()); // Middleware to parse JSON bodies

app.options('/', (req: Request, res: Response) => {
  res.header('Allow', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Origin', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', '*');
  res.status(200).send();
});

app.get('/', (req: Request, res: Response) => {
  res.send('Hello, World!');
});

app.get("/favicon.ico", (req: Request, res: Response) => {
  res.setHeader("Content-Type", "image/x-icon");
  res.status(200).send(icon);
});

app.get('/pets', (req: Request, res: Response) => {
  res.json(pets);
});

app.post('/pet', (req: Request, res: Response) => {
  const { name, owner, imageUrl, favoriteFood } = req.body;

  if (!name || !owner) {
    res.status(400).json({ error: 'Name and owner are required fields.' });
    return 
  }

  const newPet: Pet = {
    id: randomUUID(), // Generate a random UUID for the ID
    name,
    owner,
    imageUrl,
    favoriteFood,
    isFed: false, // Default value
    dateAdded: new Date(), // Auto-generate date added
  };

  pets.push(newPet);
  res.status(201).json(newPet);
});

app.patch('/pet/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const pet = pets.find((p) => p.id === id);

  if (!pet) {
    res.status(404).json({ error: 'Pet not found.' });
    return 
  }

  pet.isFed = !pet.isFed; // Toggle the isFed status
  res.status(200).json({ message: 'Pet has been fed.', pet });
});

app.delete('/pet/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const petIndex = pets.findIndex((p) => p.id === id);

  if (petIndex === -1) {
    res.status(404).json({ error: 'Pet not found.' });
    return 
  }

  pets.splice(petIndex, 1);
  res.status(200).json({ message: 'Pet has been removed.' });
});

app.get("/*notfound", (req: Request, res: Response) => {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.status(404);
  res.send(notFound);
});

if (icon && notFound) {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

export default app; // Export the app for testing purposes
export { icon, notFound }; // Export the icon and notFound for testing purposes
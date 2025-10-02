import express, { Request, Response } from "express";
import cors from "cors";
import { ProductService, Product } from "./product";

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.get("/products", async (req: Request, res: Response) => {
  const products = await ProductService.getProducts();
  res.json(products);
});

app.get("/products/:id", async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const product = await ProductService.getProduct(id);
  if (!product) return res.status(404).json({ message: "Not found" });
  res.json(product);
});

app.post("/products", async (req: Request, res: Response) => {
  try {
    const product: Product = req.body;
    const created = await ProductService.createProduct(product);
    res.status(201).json(created);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.put("/products/:id", async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const updated = await ProductService.updateProduct(id, req.body);
  if (!updated) return res.status(404).json({ message: "Not found" });
  res.json(updated);
});

app.delete("/products/:id", async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const success = await ProductService.deleteProduct(id);
  if (!success) return res.status(404).json({ message: "Not found" });
  res.status(204).send();
});

app.patch("/products/:id", async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const patched = await ProductService.patchProduct(id, req.body);
  if (!patched) return res.status(404).json({ message: "Not found" });
  res.json(patched);
});

// Server listen
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server chạy tại http://localhost:${PORT}`);
});

// Chạy bằng cách mở Terminal gõ "npm run dev" (sau khi tải các tài nguyên)
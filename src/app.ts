import "reflect-metadata";
import "./loaders";
import express from 'express';
import indexRoutes from './routes';
import { container } from 'tsyringe';
import { DIDemoService } from './service/impl/DIDemoService';

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/', indexRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);

    (container.resolve(DIDemoService)).demo();
});
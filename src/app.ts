import express, { Express, Request, Response, NextFunction } from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/database';
import productRoutes from './routes/Product';
import userRoutes from './routes/User';
import brandRoutes from './routes/Brand';
import categoryRoutes from './routes/Category';
import materialRoutes from './routes/Material';
import groupCategoryRoutes from './routes/GroupCategory';
import subCategoryRoutes from './routes/SubCategory';
import pickUpRoutes from './routes/PickUp'
import orderRoutes from './routes/Order'

dotenv.config();

const app: Express = express();

// Conectar a MongoDB Atlas
connectDB().then(() => {
    console.log('Database connection ready');
}).catch((err) => {
    console.log('Error starting database:', err);
    process.exit(1);
});

// CORS configuration
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../public')));

// Routes
app.use('/product', productRoutes);
app.use('/user', userRoutes)
app.use('/brand', brandRoutes);
app.use('/category', categoryRoutes);
app.use('/material', materialRoutes);
app.use('/groupCategory', groupCategoryRoutes);
app.use('/subCategory', subCategoryRoutes);
app.use('/pickUp', pickUpRoutes);
app.use('/order', orderRoutes);
// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Error handler
interface ErrorWithStatus extends Error {
    status?: number;
}

app.use((err: ErrorWithStatus, req: Request, res: Response, next: NextFunction) => {
    res.status(err.status || 500);
    res.json({
        error: {
            message: err.message
        }
    });
});

const PORT = parseInt(process.env.PORT || '4000', 10);
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});
export default app;
import dotenv from 'dotenv';

dotenv.config();

interface ConfigType {
    backendPort: string;
}
export const config: ConfigType = {
    backendPort: process.env.BACKEND_PORT as string
};
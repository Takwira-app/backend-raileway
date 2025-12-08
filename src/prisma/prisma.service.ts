import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "generated/prisma/client";
import { Pool } from "pg";

@Injectable()
export class PrismaService extends PrismaClient{
    constructor(private configService: ConfigService){
        const connectionString = configService.get<string>("DATABASE_URL");
        const pool = new Pool({ connectionString });
        const adapter = new PrismaPg(pool);
        super({ adapter });
    }
}
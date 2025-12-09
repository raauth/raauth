//
// instância do banco de dados
// faz com que o hot reload não crie múltiplas instâncias do client
// e cause problemas de conexão
//

import "dotenv/config";
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from "@/prisma/client/client";

const connectionString = `${process.env.DATABASE_URL}`

const adapter = new PrismaPg({ connectionString })

declare global {
  var prisma: PrismaClient | undefined
}

const db = globalThis.prisma || new PrismaClient({ adapter }) 

if(process.env.NODE_ENV !== "production"){
  globalThis.prisma = db;
};

export { db };

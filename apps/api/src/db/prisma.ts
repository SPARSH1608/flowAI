import "dotenv/config";
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../generated/prisma/client'

const connectionString = `${process.env.DATABASE_URL}`
console.log(connectionString)

const pool = new Pool({ connectionString })
pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err)
})

const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

export { prisma }
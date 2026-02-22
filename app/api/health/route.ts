import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Check if DATABASE_URL is set
    const hasDatabaseUrl = !!process.env.DATABASE_URL
    
    // Try to connect to database
    let dbStatus = 'unknown'
    let tenantCount = 0
    
    try {
      tenantCount = await prisma.tenant.count()
      dbStatus = 'connected'
    } catch (dbError) {
      dbStatus = dbError instanceof Error ? dbError.message : 'connection failed'
    }
    
    return Response.json({
      status: 'ok',
      hasDatabaseUrl,
      databaseUrlPrefix: process.env.DATABASE_URL?.substring(0, 30) + '...',
      dbStatus,
      tenantCount,
    })
  } catch (error) {
    return Response.json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}

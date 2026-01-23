import "server-only";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });
}

/**
 * Cloud/Docker 환경에서 DATABASE_URL이 주입되지 않은 상태로 서버가 부팅될 때
 * Prisma가 import 시점에 터지며 프로세스가 크래시 나는 걸 방지하기 위한 지연 초기화 헬퍼.
 *
 * - DATABASE_URL 없으면 명확한 에러를 던진다 (호출부에서 try/catch로 500 처리)
 * - 실제 PrismaClient 생성은 "처음 호출 시"에만 수행한다
 */
export function getPrisma(): PrismaClient {
  if (!process.env.DATABASE_URL) {
    throw new Error("Environment variable not found: DATABASE_URL");
  }

  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
  }

  return globalForPrisma.prisma;
}

/**
 * PrismaClient 인스턴스를 직접 export
 * API 파일에서 import { prisma } from '@/lib/prisma' 형식으로 사용 가능
 * 
 * 싱글톤 패턴으로 구현하여 개발 환경에서 Hot Reload 시에도 인스턴스가 재생성되지 않도록 보장합니다.
 */
if (!process.env.DATABASE_URL) {
  throw new Error("Environment variable not found: DATABASE_URL");
}

if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = createPrismaClient();
}

export const prisma: PrismaClient = globalForPrisma.prisma;


import { prisma } from "@/lib/db/prisma";

export type AIProviderSettingRecord = {
  id: string;
  userId: string;
  provider: string;
  apiEndpoint: string;
  apiKeyEncrypted: string;
  defaultModel: string;
  isActive: boolean;
  lastValidatedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type UpsertAIProviderSettingInput = {
  userId: string;
  provider?: string;
  apiEndpoint: string;
  apiKeyEncrypted: string;
  defaultModel: string;
  isActive?: boolean;
  lastValidatedAt?: Date | null;
};

export const aiProviderSettingRepository = {
  async findByUserId(userId: string): Promise<AIProviderSettingRecord | null> {
    return prisma.userAIProviderSetting.findUnique({
      where: { userId },
    });
  },

  async upsert(input: UpsertAIProviderSettingInput): Promise<AIProviderSettingRecord> {
    return prisma.userAIProviderSetting.upsert({
      where: { userId: input.userId },
      update: {
        provider: input.provider ?? "openai",
        apiEndpoint: input.apiEndpoint,
        apiKeyEncrypted: input.apiKeyEncrypted,
        defaultModel: input.defaultModel,
        isActive: input.isActive ?? true,
        lastValidatedAt: input.lastValidatedAt,
      },
      create: {
        userId: input.userId,
        provider: input.provider ?? "openai",
        apiEndpoint: input.apiEndpoint,
        apiKeyEncrypted: input.apiKeyEncrypted,
        defaultModel: input.defaultModel,
        isActive: input.isActive ?? true,
        lastValidatedAt: input.lastValidatedAt,
      },
    });
  },
};

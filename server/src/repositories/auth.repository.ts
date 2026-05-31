import { prisma } from '../config/prisma.js';

export const createUser = async (data: {
  username: string;
  email: string;
  password: string | null;
}) => {
  return prisma.user.create({
    data,
  });
};
export const createVerificationCode = async (data: {
  email: string;
  code: string;
  expiresAt: Date;
}) => {
  return prisma.verificationCode.upsert({
    where: {
      email: data.email,
    },
    update: {
      code: data.code,
      expiresAt: data.expiresAt,
    },
    create: {
      email: data.email,
      code: data.code,
      expiresAt: data.expiresAt,
    },
  });
};
export const findVerifyCodeByEmail = async (email: string) => {
  return prisma.verificationCode.findFirst({
    where: {
      email,
    },
  });
};
export const deleteVerifyCodeByEmail = async (email: string) => {
  return prisma.verificationCode.delete({
    where: {
      email,
    },
  });
};
export const findUserByEmail = async (email: string) => {
  return prisma.user.findFirst({
    where: {
      email,
    },
  });
};
export const findUserByUsername = async (username: string) => {
  return prisma.user.findFirst({
    where: {
      username,
    },
  });
};
export const updateUserPassword = async (email: string, password: string) => {
  return prisma.user.update({
    where: { email },
    data: { password },
  });
};
export const findUserById = async (id: string) => {
  return prisma.user.findFirst({
    where: {
      id,
    },
    select: {
      id: true,
      username: true,
      role: true,
    },
  });
};
export const createSession = async (
  userId: string,
  refreshToken: string,
  expiresAt: Date,
) => {
  return prisma.session.create({
    data: {
      userId,
      refreshToken,
      expiresAt,
    },
  });
};
export const findSessionByToken = async (token: string) => {
  return prisma.session.findFirst({
    where: {
      refreshToken: token,
    },
    include: {
      user: true,
    },
  });
};
export const deleteSession = async (token: string) => {
  return prisma.session.deleteMany({
    where: {
      refreshToken: token,
    },
  });
};

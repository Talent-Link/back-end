import { Request, Response } from 'express';
import prisma from '../../../shared/database/prisma';

export const getCandidateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      res.status(401).json({ message: 'Usuário não autenticado' });
      return;
    }

    const profile = await prisma.candidateProfile.findUnique({
      where: { userId },
      include: {
        experiences: {
          orderBy: { startDate: 'desc' }
        },
        educations: {
          orderBy: { startYear: 'desc' }
        }
      }
    });

    if (!profile) {
      res.status(404).json({ message: 'Perfil não encontrado' });
      return;
    }

    res.json(profile);
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

export const createOrUpdateCandidateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    const { phoneNumber, skills, resumeUrl, experiences, educations } = req.body;

    if (!userId) {
      res.status(401).json({ message: 'Usuário não autenticado' });
      return;
    }

    // Verificar se o usuário é candidato
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user || user.userType !== 'CANDIDATO') {
      res.status(403).json({ message: 'Apenas candidatos podem criar perfis' });
      return;
    }

    // Verificar se já existe um perfil
    const existingProfile = await prisma.candidateProfile.findUnique({
      where: { userId }
    });

    let profile;

    if (existingProfile) {
      // Atualizar perfil existente
      profile = await prisma.candidateProfile.update({
        where: { userId },
        data: {
          phoneNumber,
          skills: skills || [],
          resumeUrl
        },
        include: {
          experiences: true,
          educations: true
        }
      });
    } else {
      // Criar novo perfil
      profile = await prisma.candidateProfile.create({
        data: {
          userId,
          phoneNumber,
          skills: skills || [],
          resumeUrl
        },
        include: {
          experiences: true,
          educations: true
        }
      });
    }

    // Atualizar experiências se fornecidas
    if (experiences && Array.isArray(experiences)) {
      // Remover experiências existentes
      await prisma.professionalExperience.deleteMany({
        where: { profileId: profile.id }
      });

      // Criar novas experiências
      if (experiences.length > 0) {
        await prisma.professionalExperience.createMany({
          data: experiences.map((exp: any) => ({
            profileId: profile.id,
            position: exp.position,
            company: exp.company,
            startDate: new Date(exp.startDate),
            endDate: exp.endDate ? new Date(exp.endDate) : null,
            description: exp.description
          }))
        });
      }
    }

    // Atualizar educações se fornecidas
    if (educations && Array.isArray(educations)) {
      // Remover educações existentes
      await prisma.education.deleteMany({
        where: { profileId: profile.id }
      });

      // Criar novas educações
      if (educations.length > 0) {
        await prisma.education.createMany({
          data: educations.map((edu: any) => ({
            profileId: profile.id,
            institution: edu.institution,
            course: edu.course,
            degree: edu.degree,
            startYear: edu.startYear,
            endYear: edu.endYear
          }))
        });
      }
    }

    // Buscar o perfil completo atualizado
    const updatedProfile = await prisma.candidateProfile.findUnique({
      where: { userId },
      include: {
        experiences: {
          orderBy: { startDate: 'desc' }
        },
        educations: {
          orderBy: { startYear: 'desc' }
        }
      }
    });

    res.json(updatedProfile);
  } catch (error) {
    console.error('Erro ao criar/atualizar perfil:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

export const uploadResume = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    const { resumeUrl } = req.body;

    if (!userId) {
      res.status(401).json({ message: 'Usuário não autenticado' });
      return;
    }

    if (!resumeUrl) {
      res.status(400).json({ message: 'URL do currículo é obrigatória' });
      return;
    }

    // Buscar perfil existente
    let profile = await prisma.candidateProfile.findUnique({
      where: { userId }
    });

    let message = 'Currículo enviado com sucesso';
    let previousResumeUrl = null;

    if (!profile) {
      // Criar novo perfil com currículo
      profile = await prisma.candidateProfile.create({
        data: {
          userId,
          skills: [],
          resumeUrl
        }
      });
    } else {
      // Verificar se já existe um currículo
      if (profile.resumeUrl) {
        previousResumeUrl = profile.resumeUrl;
        message = 'Currículo substituído com sucesso';
      }

      // Atualizar com novo currículo (substitui automaticamente)
      profile = await prisma.candidateProfile.update({
        where: { userId },
        data: { resumeUrl }
      });
    }

    res.json({ 
      message, 
      resumeUrl: profile.resumeUrl,
      previousResumeUrl: previousResumeUrl 
    });
  } catch (error) {
    console.error('Erro ao fazer upload do currículo:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

export const deleteResume = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      res.status(401).json({ message: 'Usuário não autenticado' });
      return;
    }

    // Buscar perfil existente
    const profile = await prisma.candidateProfile.findUnique({
      where: { userId }
    });

    if (!profile) {
      res.status(404).json({ message: 'Perfil não encontrado' });
      return;
    }

    if (!profile.resumeUrl) {
      res.status(400).json({ message: 'Nenhum currículo encontrado para excluir' });
      return;
    }

    const deletedResumeUrl = profile.resumeUrl;

    // Remover URL do currículo
    await prisma.candidateProfile.update({
      where: { userId },
      data: { resumeUrl: null }
    });

    res.json({ 
      message: 'Currículo excluído com sucesso',
      deletedResumeUrl 
    });
  } catch (error) {
    console.error('Erro ao excluir currículo:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

export const getCandidateProfileById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { candidateId } = req.params;

    const profile = await prisma.candidateProfile.findUnique({
      where: { userId: candidateId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            photoUrl: true,
            createdAt: true
          }
        },
        experiences: {
          orderBy: { startDate: 'desc' }
        },
        educations: {
          orderBy: { startYear: 'desc' }
        }
      }
    });

    if (!profile) {
      res.status(404).json({ message: 'Perfil de candidato não encontrado' });
      return;
    }

    res.json(profile);
  } catch (error) {
    console.error('Erro ao buscar perfil do candidato:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

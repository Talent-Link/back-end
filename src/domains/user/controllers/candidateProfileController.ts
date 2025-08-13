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

// Função para o RH acessar o currículo PDF de um candidato
export const getCandidateResume = async (req: Request, res: Response): Promise<void> => {
  try {
    const { candidateId } = req.params;
    const user = req.user as any;

    // Validação de autenticação e permissão
    if (!user) {
      res.status(401).json({ message: 'Usuário não autenticado' });
      return;
    }

    if (user.userType !== 'RH') {
      res.status(403).json({ message: 'Acesso restrito a RH' });
      return;
    }

    // Busca o perfil do candidato
    const profile = await prisma.candidateProfile.findUnique({
      where: { userId: candidateId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!profile) {
      res.status(404).json({ message: 'Perfil de candidato não encontrado' });
      return;
    }

    if (!profile.resumeUrl) {
      res.status(404).json({ 
        message: 'Currículo não encontrado para este candidato',
        candidate: {
          name: profile.user.name,
          email: profile.user.email
        }
      });
      return;
    }

    // Retorna os dados do currículo
    res.json({
      candidate: {
        id: profile.user.id,
        name: profile.user.name,
        email: profile.user.email
      },
      resumeUrl: profile.resumeUrl,
      message: 'Currículo encontrado com sucesso'
    });

  } catch (error) {
    console.error('Erro ao buscar currículo do candidato:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// Função específica para RH visualizar informações adicionais do candidato
export const getCandidateAdditionalInfo = async (req: Request, res: Response): Promise<void> => {
  try {
    const { candidateId } = req.params;
    const user = req.user as any;

    console.log('🔍 Buscando informações adicionais para candidato:', candidateId);
    console.log('👤 Usuário solicitante:', user?.id, user?.userType);

    // Validação de autenticação e permissão
    if (!user) {
      res.status(401).json({ message: 'Usuário não autenticado' });
      return;
    }

    if (user.userType !== 'RH') {
      res.status(403).json({ message: 'Acesso restrito a RH' });
      return;
    }

    // Busca o perfil completo do candidato
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
      console.log('❌ Perfil não encontrado para candidato:', candidateId);
      res.status(404).json({ 
        message: 'Informações adicionais não encontradas',
        details: 'O candidato ainda não completou seu perfil profissional na plataforma'
      });
      return;
    }

    console.log('✅ Perfil encontrado:', profile.user.name);
    console.log('📊 Estatísticas:');
    console.log('  - Skills:', profile.skills?.length || 0);
    console.log('  - Experiências:', profile.experiences?.length || 0);
    console.log('  - Educação:', profile.educations?.length || 0);

    // Prepara resposta com informações organizadas
    const additionalInfo = {
      candidate: {
        id: profile.user.id,
        name: profile.user.name,
        email: profile.user.email,
        photoUrl: profile.user.photoUrl,
        memberSince: profile.user.createdAt
      },
      contact: {
        phoneNumber: profile.phoneNumber
      },
      skills: profile.skills || [],
      experiences: profile.experiences?.map(exp => ({
        id: exp.id,
        position: exp.position,
        company: exp.company,
        startDate: exp.startDate,
        endDate: exp.endDate,
        description: exp.description,
        isCurrentJob: !exp.endDate,
        duration: calculateWorkDuration(exp.startDate, exp.endDate)
      })) || [],
      educations: profile.educations?.map(edu => ({
        id: edu.id,
        institution: edu.institution,
        course: edu.course,
        degree: edu.degree,
        startYear: edu.startYear,
        endYear: edu.endYear,
        isOngoing: !edu.endYear,
        status: edu.endYear ? 'Concluído' : 'Em andamento'
      })) || [],
      summary: {
        totalSkills: profile.skills?.length || 0,
        totalExperiences: profile.experiences?.length || 0,
        totalEducations: profile.educations?.length || 0,
        hasResume: !!profile.resumeUrl,
        profileCompleteness: calculateProfileCompleteness(profile)
      },
      lastUpdated: profile.updatedAt
    };

    res.json(additionalInfo);

  } catch (error) {
    console.error('❌ Erro ao buscar informações adicionais:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// Função auxiliar para calcular duração do trabalho
const calculateWorkDuration = (startDate: Date, endDate: Date | null): string => {
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : new Date();
  
  const months = (end.getFullYear() - start.getFullYear()) * 12 + 
                 (end.getMonth() - start.getMonth());
  
  if (months < 12) {
    return `${months} ${months === 1 ? 'mês' : 'meses'}`;
  } else {
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    
    let duration = `${years} ${years === 1 ? 'ano' : 'anos'}`;
    if (remainingMonths > 0) {
      duration += ` e ${remainingMonths} ${remainingMonths === 1 ? 'mês' : 'meses'}`;
    }
    return duration;
  }
};

// Função auxiliar para calcular completude do perfil
const calculateProfileCompleteness = (profile: any): number => {
  let score = 0;
  const maxScore = 5;

  // Dados básicos (20%)
  if (profile.phoneNumber) score += 1;

  // Skills (20%)
  if (profile.skills && profile.skills.length > 0) score += 1;

  // Experiências (20%)
  if (profile.experiences && profile.experiences.length > 0) score += 1;

  // Educação (20%)
  if (profile.educations && profile.educations.length > 0) score += 1;

  // Currículo (20%)
  if (profile.resumeUrl) score += 1;

  return Math.round((score / maxScore) * 100);
};

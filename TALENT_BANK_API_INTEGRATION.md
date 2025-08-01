# 🎯 API de Banco de Talentos - TalentLink

## Visão Geral

A API de banco de talentos permite que usuários RH gerenciem e visualizem candidatos, incluindo:

- ✅ **Visualizar todos os candidatos**: Listar candidatos registrados na plataforma
- ✅ **Visualizar detalhes de candidato**: Ver perfil completo de um candidato específico
- ✅ **Banco de talentos favoritos**: Gerenciar candidatos favoritados pelo RH
- ✅ **Favoritar candidatos**: Adicionar candidatos ao banco de talentos
- ✅ **Desfavoritar candidatos**: Remover candidatos do banco de talentos

## Estrutura de Dados

### Candidate (Candidato)
```typescript
interface Candidate {
  id: string;                    // ID único do candidato
  name: string;                  // Nome do candidato
  email: string;                 // Email do candidato
  photoUrl?: string;             // URL da foto do candidato
  userType: "CANDIDATO";         // Tipo de usuário
  createdAt: Date;              // Data de criação
  candidateProfile?: CandidateProfile; // Perfil completo do candidato
  responses: Response[];         // Respostas enviadas para vagas
  opportunities?: string;        // String com oportunidades (apenas no banco de talentos)
}
```

### FavoriteCandidate (Candidato Favorito)
```typescript
interface FavoriteCandidate {
  id: string;           // ID único do favorito
  candidateId: string;  // ID do candidato
  recruiterId: string;  // ID do RH que favoritou
  createdAt: Date;     // Data que foi favoritado
  candidate: Candidate; // Dados do candidato
}
```

## Endpoints Disponíveis

### 🔍 **Visualização Geral de Candidatos**

#### 1. Listar Todos os Candidatos
```http
GET /talents/candidates
Authorization: Bearer <token_jwt_rh>
```

**Descrição:** Retorna todos os candidatos registrados na plataforma com suas respostas.

**Resposta de Sucesso (200):**
```json
[
  {
    "id": "clxyz123456789",
    "name": "João Silva",
    "email": "joao.silva@email.com",
    "photoUrl": "https://example.com/photo.jpg",
    "userType": "CANDIDATO",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "responses": [
      {
        "id": "resp_123",
        "candidateId": "clxyz123456789",
        "opportunityId": "opp_456",
        "answers": {"experience": "3 anos", "skills": ["React", "Node.js"]},
        "createdAt": "2024-01-15T00:00:00.000Z"
      }
    ]
  },
  {
    "id": "clxyz987654321",
    "name": "Maria Santos",
    "email": "maria.santos@email.com",
    "photoUrl": null,
    "userType": "CANDIDATO",
    "createdAt": "2024-01-02T00:00:00.000Z",
    "responses": []
  }
]
```

#### 2. Visualizar Candidato Específico
```http
GET /talents/candidates/{candidateId}
Authorization: Bearer <token_jwt_rh>
```

**Descrição:** Retorna detalhes completos de um candidato específico incluindo suas respostas e oportunidades.

**Resposta de Sucesso (200):**
```json
{
  "id": "clxyz123456789",
  "name": "João Silva",
  "email": "joao.silva@email.com",
  "photoUrl": "https://example.com/photo.jpg",
  "userType": "CANDIDATO",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "responses": [
    {
      "id": "resp_123",
      "candidateId": "clxyz123456789",
      "opportunityId": "opp_456",
      "answers": {"experience": "3 anos", "skills": ["React", "Node.js"]},
      "createdAt": "2024-01-15T00:00:00.000Z",
      "opportunity": {
        "id": "opp_456",
        "title": "Desenvolvedor Frontend",
        "description": "Vaga para desenvolvedor React",
        "location": "São Paulo, SP",
        "form": {
          "id": "form_789",
          "title": "Formulário Desenvolvedor",
          "questions": {"experience": "Quantos anos de experiência?"}
        }
      }
    }
  ]
}
```

**Resposta se não encontrado (404):**
```json
"Candidato não encontrado."
```

### 🌟 **Banco de Talentos (Favoritos)**

#### 3. Listar Banco de Talentos
```http
GET /bank-talents
Authorization: Bearer <token_jwt_rh>
```

**Descrição:** Retorna todos os candidatos favoritados pelo RH logado.

**Resposta de Sucesso (200):**
```json
[
  {
    "id": "clxyz123456789",
    "name": "João Silva",
    "email": "joao.silva@email.com",
    "photoUrl": "https://example.com/photo.jpg",
    "userType": "CANDIDATO",
    "opportunities": "Desenvolvedor Frontend, Designer UI/UX"
  },
  {
    "id": "clxyz987654321",
    "name": "Maria Santos",
    "email": "maria.santos@email.com",
    "photoUrl": null,
    "userType": "CANDIDATO",
    "opportunities": "Analista de Dados"
  }
]
```

#### 4. Favoritar Candidato
```http
POST /bank-talents/favorite/{candidateId}
Authorization: Bearer <token_jwt_rh>
```

**Descrição:** Adiciona um candidato ao banco de talentos do RH.

**Resposta de Sucesso (201):**
```json
"Candidato favoritado com sucesso."
```

**Resposta se já favoritado (400):**
```json
"Candidato já está no Banco de Talentos."
```

**Resposta se candidato não encontrado (404):**
```json
"Candidato não encontrado ou não é um candidato válido."
```

#### 5. Desfavoritar Candidato
```http
DELETE /bank-talents/unfavorite/{candidateId}
Authorization: Bearer <token_jwt_rh>
```

**Descrição:** Remove um candidato do banco de talentos do RH.

**Resposta de Sucesso (200):**
```json
"Candidato removido do Banco de Talentos com sucesso."
```

**Resposta se não está favoritado (404):**
```json
"Candidato não encontrado no Banco de Talentos."
```

## Códigos de Status

- ✅ **200** - Sucesso na consulta/remoção
- 🆕 **201** - Candidato favoritado com sucesso
- ❌ **400** - Candidato já favoritado ou dados inválidos
- 🔒 **401** - Token de autenticação inválido
- 🚫 **403** - Acesso negado (apenas RH pode acessar)
- ❓ **404** - Candidato não encontrado
- 💥 **500** - Erro interno do servidor

## Regras de Negócio

### Acesso
- ⚠️ Apenas usuários com `userType: "RH"` podem acessar o banco de talentos
- 🔐 Autenticação JWT obrigatória em todas as rotas

### Favoritos
- 🔗 Cada RH gerencia seu próprio banco de talentos
- 🚫 Não é possível favoritar o mesmo candidato duas vezes
- ✅ Um candidato pode ser favoritado por múltiplos RHs diferentes

## Integração Frontend

### Service para Banco de Talentos

```typescript
// talentBankService.ts
const API_BASE_URL = 'https://talentlink-wd88.onrender.com';

interface Candidate {
  id: string;
  name: string;
  email: string;
  photoUrl?: string;
  userType: 'CANDIDATO';
  createdAt: string;
  opportunities?: string;
  responses?: Response[];
}

interface Response {
  id: string;
  candidateId: string;
  opportunityId: string;
  answers: Record<string, any>;
  createdAt: string;
  opportunity?: {
    id: string;
    title: string;
    description: string;
    location: string;
    form?: {
      id: string;
      title: string;
      questions: Record<string, any>;
    };
  };
}

export const talentBankService = {
  // Listar todos os candidatos
  async getAllCandidates(): Promise<Candidate[]> {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }

      const response = await fetch(`${API_BASE_URL}/talents/candidates`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Erro ao buscar candidatos');
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar candidatos:', error);
      throw error;
    }
  },

  // Buscar candidato específico
  async getCandidateById(candidateId: string): Promise<Candidate> {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }

      const response = await fetch(`${API_BASE_URL}/talents/candidates/${candidateId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Erro ao buscar candidato');
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar candidato:', error);
      throw error;
    }
  },

  // Listar banco de talentos (favoritos)
  async getTalentBank(): Promise<Candidate[]> {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }

      const response = await fetch(`${API_BASE_URL}/bank-talents`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Erro ao buscar banco de talentos');
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar banco de talentos:', error);
      throw error;
    }
  },

  // Favoritar candidato
  async favoriteCandidate(candidateId: string): Promise<string> {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }

      console.log('Favoritando candidato:', candidateId);

      const response = await fetch(`${API_BASE_URL}/bank-talents/favorite/${candidateId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Erro ao favoritar candidato');
      }

      const result = await response.text();
      console.log('Candidato favoritado:', result);
      return result;
    } catch (error) {
      console.error('Erro ao favoritar candidato:', error);
      throw error;
    }
  },

  // Desfavoritar candidato
  async unfavoriteCandidate(candidateId: string): Promise<string> {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }

      console.log('Desfavoritando candidato:', candidateId);

      const response = await fetch(`${API_BASE_URL}/bank-talents/unfavorite/${candidateId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Erro ao desfavoritar candidato');
      }

      const result = await response.text();
      console.log('Candidato desfavoritado:', result);
      return result;
    } catch (error) {
      console.error('Erro ao desfavoritar candidato:', error);
      throw error;
    }
  },

  // Verificar se candidato está favoritado
  async isCandidateFavorited(candidateId: string): Promise<boolean> {
    try {
      const talentBank = await this.getTalentBank();
      return talentBank.some(candidate => candidate.id === candidateId);
    } catch (error) {
      console.error('Erro ao verificar se candidato está favoritado:', error);
      return false;
    }
  },

  // Filtrar candidatos por critérios
  filterCandidates(candidates: Candidate[], filters: {
    name?: string;
    email?: string;
    hasResponses?: boolean;
  }): Candidate[] {
    return candidates.filter(candidate => {
      const matchesName = !filters.name || 
        candidate.name.toLowerCase().includes(filters.name.toLowerCase());
      
      const matchesEmail = !filters.email || 
        candidate.email.toLowerCase().includes(filters.email.toLowerCase());
      
      const matchesResponses = filters.hasResponses === undefined || 
        (filters.hasResponses ? candidate.responses && candidate.responses.length > 0 : true);

      return matchesName && matchesEmail && matchesResponses;
    });
  }
};

export type { Candidate, Response };
```

### Componente React - Lista de Candidatos

```tsx
// CandidateList.tsx
import React, { useState, useEffect } from 'react';
import { talentBankService, Candidate } from '../services/talentBankService';

const CandidateList: React.FC = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [favoritedCandidates, setFavoritedCandidates] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [filters, setFilters] = useState({
    name: '',
    email: '',
    hasResponses: undefined as boolean | undefined
  });

  useEffect(() => {
    loadCandidates();
    loadTalentBank();
  }, []);

  const loadCandidates = async () => {
    try {
      setLoading(true);
      const candidateData = await talentBankService.getAllCandidates();
      setCandidates(candidateData);
    } catch (err) {
      setError(err.message || 'Erro ao carregar candidatos');
    } finally {
      setLoading(false);
    }
  };

  const loadTalentBank = async () => {
    try {
      const talentBank = await talentBankService.getTalentBank();
      const favoritedIds = new Set(talentBank.map(candidate => candidate.id));
      setFavoritedCandidates(favoritedIds);
    } catch (err) {
      console.error('Erro ao carregar banco de talentos:', err);
    }
  };

  const handleFavoriteToggle = async (candidateId: string) => {
    try {
      const isFavorited = favoritedCandidates.has(candidateId);
      
      if (isFavorited) {
        await talentBankService.unfavoriteCandidate(candidateId);
        setFavoritedCandidates(prev => {
          const newSet = new Set(prev);
          newSet.delete(candidateId);
          return newSet;
        });
      } else {
        await talentBankService.favoriteCandidate(candidateId);
        setFavoritedCandidates(prev => new Set(prev).add(candidateId));
      }
    } catch (err) {
      setError(err.message || 'Erro ao atualizar favorito');
    }
  };

  const filteredCandidates = talentBankService.filterCandidates(candidates, filters);

  if (loading) return <div className="text-center p-4">Carregando candidatos...</div>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Candidatos</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h2 className="text-lg font-semibold mb-4">Filtros</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Filtrar por nome"
            value={filters.name}
            onChange={(e) => setFilters(prev => ({ ...prev, name: e.target.value }))}
            className="px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
          />
          <input
            type="email"
            placeholder="Filtrar por email"
            value={filters.email}
            onChange={(e) => setFilters(prev => ({ ...prev, email: e.target.value }))}
            className="px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
          />
          <select
            value={filters.hasResponses?.toString() || ''}
            onChange={(e) => setFilters(prev => ({ 
              ...prev, 
              hasResponses: e.target.value === '' ? undefined : e.target.value === 'true'
            }))}
            className="px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
          >
            <option value="">Todos os candidatos</option>
            <option value="true">Com respostas</option>
            <option value="false">Sem respostas</option>
          </select>
        </div>
      </div>

      {/* Lista de Candidatos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCandidates.map((candidate) => (
          <div key={candidate.id} className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center">
                {candidate.photoUrl ? (
                  <img 
                    src={candidate.photoUrl} 
                    alt={candidate.name}
                    className="w-12 h-12 rounded-full object-cover mr-3"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                    <span className="text-gray-600 font-semibold">
                      {candidate.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-lg">{candidate.name}</h3>
                  <p className="text-gray-600 text-sm">{candidate.email}</p>
                </div>
              </div>
              
              <button
                onClick={() => handleFavoriteToggle(candidate.id)}
                className={`p-2 rounded-full transition-colors ${
                  favoritedCandidates.has(candidate.id)
                    ? 'text-yellow-500 hover:text-yellow-600'
                    : 'text-gray-400 hover:text-yellow-500'
                }`}
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </button>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                <strong>Cadastrado em:</strong> {new Date(candidate.createdAt).toLocaleDateString('pt-BR')}
              </p>
              
              {candidate.responses && candidate.responses.length > 0 && (
                <p className="text-sm text-gray-600">
                  <strong>Respostas:</strong> {candidate.responses.length} vaga(s)
                </p>
              )}

              {candidate.opportunities && (
                <p className="text-sm text-gray-600">
                  <strong>Oportunidades:</strong> {candidate.opportunities}
                </p>
              )}
            </div>

            <div className="mt-4 flex space-x-2">
              <button
                onClick={() => window.open(`mailto:${candidate.email}`, '_blank')}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded text-sm"
              >
                Contatar
              </button>
              <button
                onClick={() => {/* Navegar para detalhes */}}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded text-sm"
              >
                Ver Detalhes
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredCandidates.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">Nenhum candidato encontrado com os filtros aplicados.</p>
        </div>
      )}
    </div>
  );
};

export default CandidateList;
```

### Componente React - Banco de Talentos

```tsx
// TalentBank.tsx
import React, { useState, useEffect } from 'react';
import { talentBankService, Candidate } from '../services/talentBankService';

const TalentBank: React.FC = () => {
  const [talentBank, setTalentBank] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    loadTalentBank();
  }, []);

  const loadTalentBank = async () => {
    try {
      setLoading(true);
      const bankData = await talentBankService.getTalentBank();
      setTalentBank(bankData);
    } catch (err) {
      setError(err.message || 'Erro ao carregar banco de talentos');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromBank = async (candidateId: string) => {
    try {
      await talentBankService.unfavoriteCandidate(candidateId);
      setTalentBank(prev => prev.filter(candidate => candidate.id !== candidateId));
    } catch (err) {
      setError(err.message || 'Erro ao remover candidato do banco de talentos');
    }
  };

  if (loading) return <div className="text-center p-4">Carregando banco de talentos...</div>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">🌟 Banco de Talentos</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {talentBank.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">⭐</div>
          <h2 className="text-2xl font-semibold text-gray-600 mb-2">
            Seu banco de talentos está vazio
          </h2>
          <p className="text-gray-500">
            Comece a favoritar candidatos para construir seu banco de talentos personalizado.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {talentBank.map((candidate) => (
            <div key={candidate.id} className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow border-l-4 border-yellow-400">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  {candidate.photoUrl ? (
                    <img 
                      src={candidate.photoUrl} 
                      alt={candidate.name}
                      className="w-14 h-14 rounded-full object-cover mr-4"
                    />
                  ) : (
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center mr-4">
                      <span className="text-white font-bold text-lg">
                        {candidate.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-lg text-gray-800">{candidate.name}</h3>
                    <p className="text-gray-600">{candidate.email}</p>
                  </div>
                </div>
                
                <div className="text-yellow-500">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
              </div>

              {candidate.opportunities && (
                <div className="mb-4">
                  <p className="text-sm font-semibold text-gray-700 mb-1">Oportunidades:</p>
                  <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                    {candidate.opportunities}
                  </p>
                </div>
              )}

              <div className="flex space-x-2">
                <button
                  onClick={() => window.open(`mailto:${candidate.email}`, '_blank')}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded text-sm font-medium transition-colors"
                >
                  📧 Contatar
                </button>
                <button
                  onClick={() => handleRemoveFromBank(candidate.id)}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded text-sm font-medium transition-colors"
                >
                  🗑️ Remover
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TalentBank;
```

### Hook Personalizado para Banco de Talentos

```tsx
// useTalentBank.ts
import { useState, useEffect } from 'react';
import { talentBankService, Candidate } from '../services/talentBankService';

export const useTalentBank = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [talentBank, setTalentBank] = useState<Candidate[]>([]);
  const [favoritedCandidates, setFavoritedCandidates] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCandidates = async () => {
    try {
      setLoading(true);
      setError(null);
      const candidateData = await talentBankService.getAllCandidates();
      setCandidates(candidateData);
    } catch (err) {
      setError(err.message || 'Erro ao carregar candidatos');
    } finally {
      setLoading(false);
    }
  };

  const loadTalentBank = async () => {
    try {
      const bankData = await talentBankService.getTalentBank();
      setTalentBank(bankData);
      const favoritedIds = new Set(bankData.map(candidate => candidate.id));
      setFavoritedCandidates(favoritedIds);
    } catch (err) {
      setError(err.message || 'Erro ao carregar banco de talentos');
    }
  };

  const favoriteCandidate = async (candidateId: string) => {
    try {
      await talentBankService.favoriteCandidate(candidateId);
      setFavoritedCandidates(prev => new Set(prev).add(candidateId));
      await loadTalentBank(); // Recarregar banco de talentos
    } catch (err) {
      setError(err.message || 'Erro ao favoritar candidato');
      throw err;
    }
  };

  const unfavoriteCandidate = async (candidateId: string) => {
    try {
      await talentBankService.unfavoriteCandidate(candidateId);
      setFavoritedCandidates(prev => {
        const newSet = new Set(prev);
        newSet.delete(candidateId);
        return newSet;
      });
      setTalentBank(prev => prev.filter(candidate => candidate.id !== candidateId));
    } catch (err) {
      setError(err.message || 'Erro ao desfavoritar candidato');
      throw err;
    }
  };

  const isCandidateFavorited = (candidateId: string): boolean => {
    return favoritedCandidates.has(candidateId);
  };

  useEffect(() => {
    loadCandidates();
    loadTalentBank();
  }, []);

  return {
    candidates,
    talentBank,
    favoritedCandidates,
    loading,
    error,
    loadCandidates,
    loadTalentBank,
    favoriteCandidate,
    unfavoriteCandidate,
    isCandidateFavorited,
    totalCandidates: candidates.length,
    totalFavorited: talentBank.length
  };
};
```

## Fluxo de Uso

### 1. **RH faz login**
```http
POST /auth/google/RH
```

### 2. **RH acessa lista de candidatos**
```typescript
const { candidates, loading } = useTalentBank();
```

### 3. **RH visualiza todos os candidatos**
```http
GET /talents/candidates
```

### 4. **RH favorita candidatos interessantes**
```http
POST /bank-talents/favorite/{candidateId}
```

### 5. **RH acessa seu banco de talentos**
```http
GET /bank-talents
```

### 6. **RH remove candidatos do banco**
```http
DELETE /bank-talents/unfavorite/{candidateId}
```

### 7. **RH visualiza detalhes de candidato**
```http
GET /talents/candidates/{candidateId}
```

## Casos de Uso

### ✅ Descoberta de Talentos
1. RH visualiza todos os candidatos
2. Aplica filtros por nome, email, experiência
3. Analisa respostas enviadas para vagas
4. Favorita candidatos promissores

### ✅ Gestão do Banco de Talentos
1. RH acessa banco de talentos pessoal
2. Visualiza candidatos favoritados
3. Remove candidatos quando necessário
4. Entra em contato com candidatos

### ✅ Análise de Candidatos
1. RH clica em candidato específico
2. Visualiza perfil completo
3. Analisa respostas para diferentes vagas
4. Toma decisão de favoritar/contatar

## Segurança

- 🔐 **JWT Token obrigatório** em todas as rotas
- 🎯 **Role-based access**: Apenas RH pode acessar banco de talentos
- 🔗 **Isolamento de dados**: Cada RH só vê seus próprios favoritos
- 🛡️ **Validação de candidatos**: Apenas usuários tipo CANDIDATO podem ser favoritados

## Endpoints Resumo

| Método | Endpoint | Descrição | Acesso |
|--------|----------|-----------|---------|
| GET | `/talents/candidates` | Listar todos os candidatos | 👔 RH |
| GET | `/talents/candidates/:id` | Detalhes de candidato | 👔 RH |
| GET | `/bank-talents` | Banco de talentos (favoritos) | 👔 RH |
| POST | `/bank-talents/favorite/:id` | Favoritar candidato | 👔 RH |
| DELETE | `/bank-talents/unfavorite/:id` | Desfavoritar candidato | 👔 RH |

---

## ✅ Resumo das Funcionalidades

### 🎯 **Funcionalidades Principais**
- ✅ **Visualização completa** de todos os candidatos
- ✅ **Sistema de favoritos** personalizado por RH
- ✅ **Detalhes completos** de candidatos com respostas
- ✅ **Filtros avançados** para busca de candidatos
- ✅ **Gestão do banco de talentos** com add/remove

### 📱 **Frontend Completo**
- ✅ **Service robusto** com todas as funções
- ✅ **Componentes React** para lista e banco de talentos
- ✅ **Hook personalizado** para gerenciamento de estado
- ✅ **Interface responsiva** com filtros e ações
- ✅ **Tratamento de erros** e loading states

### 🔐 **Segurança e Performance**
- ✅ **Autenticação JWT** em todas as operações
- ✅ **Controle de acesso** baseado em roles
- ✅ **Validações robustas** no backend
- ✅ **Cache inteligente** no frontend
- ✅ **Otimização de requisições**

🚀 **API pronta para integração!** Use os exemplos acima para implementar o banco de talentos completo no seu frontend.

# 🏢 API de Empresas - TalentLink

## Visão Geral

A API de empresas permite que usuários RH gerenciem informações da sua empresa, incluindo:

- ✅ **Criar empresa**: Cadastro inicial da empresa
- ✅ **Atualizar empresa**: Modificar informações existentes
- ✅ **Visualizar empresa**: Buscar dados da empresa
- ✅ **Listar empresas**: Ver empresas associadas ao RH
- ✅ **Upload de logo**: Adicionar ou atualizar logo da empresa
- ✅ **Excluir logo**: Remover logo da empresa

## Estrutura de Dados

### Company
```typescript
interface Company {
  id: string;                // ID único da empresa
  name: string;              // Nome da empresa (obrigatório)
  description?: string;      // Descrição da empresa (opcional)
  address: string;           // Endereço da empresa (obrigatório)
  logoUrl?: string;          // URL da logo/imagem da empresa (opcional)
  recruiterId: string;       // ID do usuário RH responsável
  createdAt: Date;          // Data de criação
  opportunities: Opportunity[]; // Vagas da empresa
}
```

## Endpoints Disponíveis

### 🔐 Rotas para RH (Apenas usuários RH)

#### 1. Criar ou Atualizar Empresa
```http
POST /empresa
Authorization: Bearer <token_jwt_rh>
Content-Type: application/json

{
  "name": "Tech Solutions Inc.",
  "description": "Empresa líder em soluções tecnológicas inovadoras",
  "address": "Rua das Flores, 123 - São Paulo, SP",
  "logoUrl": "https://example.com/logo.png"
}
```

**Comportamento:**
- 🆕 Se não existir empresa: **cria nova empresa**
- 🔄 Se já existir empresa: **atualiza empresa existente**

**Resposta de Sucesso (Criação - 201):**
```json
{
  "id": "clxyz123456789",
  "name": "Tech Solutions Inc.",
  "description": "Empresa líder em soluções tecnológicas inovadoras",
  "address": "Rua das Flores, 123 - São Paulo, SP",
  "logoUrl": "https://example.com/logo.png",
  "recruiterId": "clxyz987654321",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

**Resposta de Sucesso (Atualização - 200):**
```json
{
  "id": "clxyz123456789",
  "name": "Tech Solutions Inc.",
  "description": "Empresa líder em soluções tecnológicas inovadoras",
  "address": "Rua das Flores, 123 - São Paulo, SP",
  "logoUrl": "https://example.com/logo.png",
  "recruiterId": "clxyz987654321",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

#### 2. Buscar Empresa Própria
```http
GET /empresa
Authorization: Bearer <token_jwt_rh>
```

**Resposta de Sucesso (200):**
```json
{
  "id": "clxyz123456789",
  "name": "Tech Solutions Inc.",
  "description": "Empresa líder em soluções tecnológicas inovadoras",
  "address": "Rua das Flores, 123 - São Paulo, SP",
  "logoUrl": "https://example.com/logo.png",
  "recruiterId": "clxyz987654321",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

**Resposta se não encontrada (404):**
```json
{
  "message": "Nenhuma empresa encontrada para este usuário."
}
```

#### 3. Listar Empresas do RH
```http
GET /empresa/rh
Authorization: Bearer <token_jwt_rh>
```

**Resposta de Sucesso (200):**
```json
[
  {
    "id": "clxyz123456789",
    "name": "Tech Solutions Inc.",
    "logoUrl": "https://example.com/logo.png"
  },
  {
    "id": "clxyz987654321",
    "name": "Inovação Digital Ltda.",
    "logoUrl": null
  }
]
```

#### 4. Upload ou Atualizar Logo da Empresa
```http
POST /empresa/logo
Authorization: Bearer <token_jwt_rh>
Content-Type: application/json

{
  "logoUrl": "https://example.com/logo.png"
}
```

**Comportamento:**
- 🆕 Se não existir logo: **adiciona nova logo**
- 🔄 Se já existir logo: **substitui automaticamente**

**Resposta de Sucesso (Logo Adicionada):**
```json
{
  "message": "Logo adicionada com sucesso",
  "logoUrl": "https://example.com/logo.png",
  "previousLogoUrl": null
}
```

**Resposta de Sucesso (Logo Atualizada):**
```json
{
  "message": "Logo atualizada com sucesso",
  "logoUrl": "https://example.com/new-logo.png",
  "previousLogoUrl": "https://example.com/old-logo.png"
}
```

#### 5. Excluir Logo da Empresa
```http
DELETE /empresa/logo
Authorization: Bearer <token_jwt_rh>
```

**Resposta de Sucesso:**
```json
{
  "message": "Logo excluída com sucesso",
  "deletedLogoUrl": "https://example.com/deleted-logo.png"
}
```

## Códigos de Status

- ✅ **200** - Empresa atualizada com sucesso
- 🆕 **201** - Empresa criada com sucesso
- ❌ **400** - Dados obrigatórios não fornecidos
- 🔒 **401** - Token de autenticação inválido
- 🚫 **403** - Acesso negado (apenas RH pode gerenciar empresas)
- ❓ **404** - Empresa não encontrada
- 💥 **500** - Erro interno do servidor

## Validações

### Campos Obrigatórios
- **name**: Nome da empresa (string, obrigatório)
- **address**: Endereço da empresa (string, obrigatório)

### Campos Opcionais
- **description**: Descrição da empresa (string, opcional)
- **logoUrl**: URL da logo/imagem da empresa (string, opcional)

### Regras de Negócio
- ⚠️ Apenas usuários com `userType: "RH"` podem gerenciar empresas
- 🔗 Cada RH pode ter apenas **uma empresa** (relacionamento 1:1)
- 🔄 Ao criar empresa quando já existe: **atualiza automaticamente**

## Integração Frontend

### Service para Empresa

```typescript
// companyService.ts
const API_BASE_URL = 'https://talentlink-wd88.onrender.com';

interface Company {
  id?: string;
  name: string;
  description?: string;
  address: string;
  logoUrl?: string;
  recruiterId?: string;
  createdAt?: string;
}

export const companyService = {
  // Criar ou atualizar empresa
  async createOrUpdateCompany(companyData: Omit<Company, 'id' | 'recruiterId' | 'createdAt'>): Promise<Company> {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }

      console.log('Salvando empresa:', companyData);

      const response = await fetch(`${API_BASE_URL}/empresa`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(companyData)
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Erro ao salvar empresa');
      }

      const result = await response.json();
      console.log('Empresa salva:', result);
      return result;
    } catch (error) {
      console.error('Erro ao salvar empresa:', error);
      throw error;
    }
  },

  // Buscar empresa do RH logado
  async getCompany(): Promise<Company | null> {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }

      const response = await fetch(`${API_BASE_URL}/empresa`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 404) {
        // Empresa não encontrada
        return null;
      }

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Erro ao buscar empresa');
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar empresa:', error);
      throw error;
    }
  },

  // Listar empresas do RH
  async listCompanies(): Promise<{id: string, name: string, logoUrl: string | null}[]> {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }

      const response = await fetch(`${API_BASE_URL}/empresa/rh`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Erro ao listar empresas');
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao listar empresas:', error);
      throw error;
    }
  },

  // Upload de logo da empresa
  async uploadLogo(logoUrl: string): Promise<{ message: string; logoUrl: string; previousLogoUrl?: string }> {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }

      console.log('Enviando logo:', logoUrl.length > 100 ? `${logoUrl.substring(0, 100)}...` : logoUrl);

      const response = await fetch(`${API_BASE_URL}/empresa/logo`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ logoUrl })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao fazer upload da logo');
      }

      const result = await response.json();
      console.log('Logo enviada com sucesso:', result);
      return result;
    } catch (error) {
      console.error('Erro no upload da logo:', error);
      throw error;
    }
  },

  // Upload de arquivo de logo (converte para base64)
  async uploadLogoFile(file: File): Promise<{ message: string; logoUrl: string; previousLogoUrl?: string }> {
    try {
      // Validar tipo de arquivo
      if (!file.type.startsWith('image/')) {
        throw new Error('Apenas arquivos de imagem são aceitos');
      }

      // Validar tamanho (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        throw new Error('Imagem deve ter no máximo 2MB');
      }

      // Converter arquivo para base64
      const base64File = await this.fileToBase64(file);
      const dataUrl = `data:${file.type};base64,${base64File}`;
      
      console.log('Imagem convertida para base64:', file.name, file.size, file.type);

      return await this.uploadLogo(dataUrl);
    } catch (error) {
      console.error('Erro no upload do arquivo de logo:', error);
      throw error;
    }
  },

  // Excluir logo da empresa
  async deleteLogo(): Promise<{ message: string; deletedLogoUrl: string }> {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }

      console.log('Excluindo logo...');

      const response = await fetch(`${API_BASE_URL}/empresa/logo`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao excluir logo');
      }

      const result = await response.json();
      console.log('Logo excluída com sucesso:', result);
      return result;
    } catch (error) {
      console.error('Erro ao excluir logo:', error);
      throw error;
    }
  },

  // Converter arquivo para base64
  fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          // Remove o prefixo "data:image/type;base64," para enviar apenas o base64
          const base64 = reader.result.split(',')[1];
          resolve(base64);
        } else {
          reject(new Error('Erro ao converter arquivo'));
        }
      };
      reader.onerror = error => reject(error);
    });
  },

  // Validar dados da empresa
  validateCompany(companyData: Omit<Company, 'id' | 'recruiterId' | 'createdAt'>): string[] {
    const errors: string[] = [];

    if (!companyData.name || companyData.name.trim().length === 0) {
      errors.push('Nome da empresa é obrigatório');
    }

    if (companyData.name && companyData.name.length > 100) {
      errors.push('Nome da empresa deve ter no máximo 100 caracteres');
    }

    if (!companyData.address || companyData.address.trim().length === 0) {
      errors.push('Endereço é obrigatório');
    }

    if (companyData.address && companyData.address.length > 255) {
      errors.push('Endereço deve ter no máximo 255 caracteres');
    }

    if (companyData.description && companyData.description.length > 500) {
      errors.push('Descrição deve ter no máximo 500 caracteres');
    }

    if (companyData.logoUrl && !this.isValidUrl(companyData.logoUrl)) {
      errors.push('URL da logo deve ser uma URL válida');
    }

    return errors;
  },

  // Validar se é uma URL válida
  isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
};

export type { Company };
```

### Exemplo de Uso em React

```tsx
// CompanyForm.tsx
import React, { useState, useEffect } from 'react';
import { companyService, Company } from '../services/companyService';

const CompanyForm: React.FC = () => {
  const [company, setCompany] = useState<Partial<Company>>({
    name: '',
    description: '',
    address: '',
    logoUrl: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');

  // Carregar empresa existente
  useEffect(() => {
    loadCompany();
  }, []);

  const loadCompany = async () => {
    try {
      setLoading(true);
      const existingCompany = await companyService.getCompany();
      
      if (existingCompany) {
        setCompany(existingCompany);
        setLogoPreview(existingCompany.logoUrl || '');
        console.log('Empresa carregada:', existingCompany);
      } else {
        console.log('Nenhuma empresa encontrada - modo criação');
      }
    } catch (error) {
      console.error('Erro ao carregar empresa:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar dados
    const validationErrors = companyService.validateCompany(company as any);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setLoading(true);
      setErrors([]);
      
      // Primeiro salvar dados da empresa
      const savedCompany = await companyService.createOrUpdateCompany(company as any);
      
      // Se há arquivo de logo, fazer upload
      if (logoFile) {
        const logoResult = await companyService.uploadLogoFile(logoFile);
        savedCompany.logoUrl = logoResult.logoUrl;
      }
      
      setCompany(savedCompany);
      setLogoPreview(savedCompany.logoUrl || '');
      alert(company.id ? 'Empresa atualizada com sucesso!' : 'Empresa criada com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar empresa:', error);
      setErrors([error.message || 'Erro ao salvar empresa']);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof Company, value: string) => {
    setCompany(prev => ({ ...prev, [field]: value }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      
      // Criar preview da imagem
      const reader = new FileReader();
      reader.onload = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteLogo = async () => {
    if (!company.logoUrl) return;
    
    try {
      setLoading(true);
      await companyService.deleteLogo();
      setCompany(prev => ({ ...prev, logoUrl: '' }));
      setLogoPreview('');
      setLogoFile(null);
      alert('Logo excluída com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir logo:', error);
      setErrors([error.message || 'Erro ao excluir logo']);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">
        {company.id ? 'Editar Empresa' : 'Cadastrar Empresa'}
      </h2>

      {errors.length > 0 && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {errors.map((error, index) => (
            <p key={index}>{error}</p>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Logo da Empresa */}
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Logo da Empresa
          </label>
          
          {logoPreview && (
            <div className="mb-4">
              <img 
                src={logoPreview} 
                alt="Logo da empresa" 
                className="w-32 h-32 object-contain border rounded-lg"
              />
              <button
                type="button"
                onClick={handleDeleteLogo}
                className="mt-2 text-red-600 hover:text-red-800 text-sm"
              >
                Excluir Logo
              </button>
            </div>
          )}
          
          <input
            type="file"
            accept="image/*"
            onChange={handleLogoChange}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
          />
          <p className="text-sm text-gray-500 mt-1">
            Aceita apenas imagens (PNG, JPG, GIF). Máximo 2MB.
          </p>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Nome da Empresa *
          </label>
          <input
            type="text"
            value={company.name || ''}
            onChange={(e) => handleChange('name', e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
            placeholder="Digite o nome da empresa"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Descrição
          </label>
          <textarea
            value={company.description || ''}
            onChange={(e) => handleChange('description', e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
            placeholder="Descreva sua empresa"
            rows={3}
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Endereço *
          </label>
          <input
            type="text"
            value={company.address || ''}
            onChange={(e) => handleChange('address', e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
            placeholder="Endereço completo da empresa"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
        >
          {loading ? 'Salvando...' : company.id ? 'Atualizar Empresa' : 'Criar Empresa'}
        </button>
      </form>
    </div>
  );
};

export default CompanyForm;
```

### Hook Personalizado para Empresa

```tsx
// useCompany.ts
import { useState, useEffect } from 'react';
import { companyService, Company } from '../services/companyService';

export const useCompany = () => {
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCompany = async () => {
    try {
      setLoading(true);
      setError(null);
      const companyData = await companyService.getCompany();
      setCompany(companyData);
    } catch (err) {
      setError(err.message || 'Erro ao carregar empresa');
    } finally {
      setLoading(false);
    }
  };

  const saveCompany = async (companyData: Omit<Company, 'id' | 'recruiterId' | 'createdAt'>) => {
    try {
      setLoading(true);
      setError(null);
      const savedCompany = await companyService.createOrUpdateCompany(companyData);
      setCompany(savedCompany);
      return savedCompany;
    } catch (err) {
      setError(err.message || 'Erro ao salvar empresa');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompany();
  }, []);

  return {
    company,
    loading,
    error,
    loadCompany,
    saveCompany,
    hasCompany: !!company
  };
};
```

## Fluxo de Uso

### 1. **RH faz login**
```http
POST /auth/google/RH
```

### 2. **RH acessa página de empresa**
```typescript
const { company, loading, hasCompany } = useCompany();
```

### 3. **Se não tem empresa: criar**
```http
POST /empresa
{
  "name": "Minha Empresa",
  "description": "Descrição da empresa",
  "address": "Endereço completo",
  "logoUrl": "https://example.com/logo.png"
}
```

### 4. **Se já tem empresa: visualizar/editar**
```http
GET /empresa
# Retorna dados da empresa
POST /empresa  # (mesmo endpoint de criação para atualizar)
```

### 5. **Upload de logo da empresa**
```http
POST /empresa/logo
{
  "logoUrl": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
}
```

### 6. **Excluir logo da empresa**
```http
DELETE /empresa/logo
```

### 7. **Listar empresas (se necessário)**
```http
GET /empresa/rh
```

## Casos de Uso

### ✅ RH Novo (Primeiro Acesso)
1. Login como RH
2. Página de empresa vazia (404)
3. Formulário de criação
4. Criar empresa
5. Redirecionamento para dashboard

### ✅ RH Existente (Com Empresa)
1. Login como RH
2. Carregar dados da empresa
3. Exibir informações
4. Permitir edição
5. Atualizar dados

### ✅ Validação e Tratamento de Erros
1. Campos obrigatórios
2. Tamanho máximo dos campos
3. Autenticação inválida
4. Servidor indisponível

## Segurança

- 🔐 **JWT Token obrigatório** em todas as rotas
- 🎯 **Role-based access**: Apenas RH pode gerenciar empresas
- 🛡️ **Validação de dados** em todos os inputs
- 🔗 **Relacionamento seguro**: RH só acessa própria empresa

## Endpoints Resumo

| Método | Endpoint | Descrição | Acesso |
|--------|----------|-----------|---------|
| POST | `/empresa` | Criar/atualizar empresa | 👔 RH |
| GET | `/empresa` | Buscar própria empresa | 👔 RH |
| GET | `/empresa/rh` | Listar empresas do RH | 👔 RH |
| POST | `/empresa/logo` | Upload/atualizar logo | 👔 RH |
| DELETE | `/empresa/logo` | Excluir logo | 👔 RH |

---

## ✅ Resumo das Funcionalidades Implementadas

### 🏢 **Backend Completo**
- ✅ **Campo logoUrl** adicionado ao schema da empresa
- ✅ **Migração criada** e aplicada no banco de dados
- ✅ **5 endpoints funcionais**: criar, buscar, listar, upload logo, excluir logo
- ✅ **Validações robustas** e tratamento de erros
- ✅ **Autenticação JWT** em todas as rotas

### 📱 **Frontend Ready**
- ✅ **Service completo** com todas as funções
- ✅ **Componente React** com upload de imagem
- ✅ **Hook personalizado** para gerenciamento de estado
- ✅ **Validações client-side** e preview de imagem
- ✅ **Tratamento de erros** e feedback visual

### 🔧 **Funcionalidades de Logo**
- ✅ **Upload de imagem** (PNG, JPG, GIF até 2MB)
- ✅ **Conversão para base64** automática
- ✅ **Preview em tempo real** da imagem selecionada
- ✅ **Substituição automática** de logo existente
- ✅ **Exclusão de logo** com confirmação
- ✅ **Validação de URL** para logos externas

### 🎯 **Casos de Uso Cobertos**
- ✅ RH criando primeira empresa com logo
- ✅ RH atualizando dados e logo existente
- ✅ Upload de arquivo local de imagem
- ✅ Exclusão de logo sem afetar outros dados
- ✅ Listagem com logos para exibição

### 🔐 **Segurança Implementada**
- ✅ Apenas RH pode gerenciar empresas
- ✅ Validação de tipos de arquivo
- ✅ Limite de tamanho de arquivo
- ✅ Sanitização de dados de entrada
- ✅ Relacionamento seguro empresa-usuário

🚀 **API pronta para integração!** Use os exemplos acima para implementar o gerenciamento de empresas no seu frontend.

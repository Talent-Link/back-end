# 👥 API - Visualizar Candidatos e Currículos (RH)

## 📋 Endpoints Disponíveis

### 1. Listar Candidatos por Oportunidade
**Endpoint:** `GET /opportunities/:id/candidates`  
**Permissão:** Apenas RH  

### 2. Visualizar Currículo do Candidato
**Endpoint:** `GET /users/profile/:candidateId/resume`  
**Permissão:** Apenas RH  

---

## 🎯 1. Listar Candidatos por Oportunidade

### 📤 Resposta (200)
```json
{
  "opportunity": {
    "id": "opportunity_id",
    "title": "Desenvolvedor Full Stack",
    "description": "Vaga para desenvolvedor experiente",
    "location": "São Paulo, SP",
    "company": {
      "name": "Tech Company",
      "address": "Av. Paulista, 1000"
    }
  },
  "totalCandidates": 3,
  "candidates": [
    {
      "candidatureId": "response_id_1",
      "candidatureDate": "2025-08-12T10:30:00.000Z",
      "answers": {
        "question1": "Resposta do candidato"
      },
      "candidate": {
        "id": "candidate_id_1",
        "name": "João Silva",
        "email": "joao@email.com",
        "photoUrl": "https://example.com/photo.jpg",
        "memberSince": "2025-01-15T08:00:00.000Z",
        "profile": {
          "phoneNumber": "+55 11 99999-9999",
          "hasResume": true,
          "skills": ["JavaScript", "React", "Node.js"]
        }
      }
    }
  ]
}
```

---

## 📄 2. Visualizar Currículo do Candidato

### 📤 Resposta de Sucesso (200)
```json
{
  "candidate": {
    "id": "candidate_id_1",
    "name": "João Silva",
    "email": "joao@email.com"
  },
  "resumeUrl": "https://storage.com/curriculos/joao-silva.pdf",
  "message": "Currículo encontrado com sucesso"
}
```

### 📤 Resposta - Sem Currículo (404)
```json
{
  "message": "Currículo não encontrado para este candidato",
  "candidate": {
    "name": "João Silva",
    "email": "joao@email.com"
  }
}
```

---

## ⚛️ Exemplo de Uso no Frontend

### Hook para Gerenciar Candidatos
```javascript
const useCandidatesManager = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const fetchCandidates = async (opportunityId) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/opportunities/${opportunityId}/candidates`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setCandidates(data);
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCandidateResume = async (candidateId) => {
    try {
      const response = await fetch(`${API_BASE}/users/profile/${candidateId}/resume`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        // Abrir o PDF em nova aba
        window.open(data.resumeUrl, '_blank');
      } else {
        const error = await response.json();
        alert(error.message);
      }
    } catch (error) {
      console.error('Erro ao buscar currículo:', error);
    }
  };

  return { candidates, loading, fetchCandidates, getCandidateResume };
};
```

### Componente da Lista de Candidatos
```javascript
const CandidatesList = ({ opportunityId }) => {
  const { candidates, loading, fetchCandidates, getCandidateResume } = useCandidatesManager();

  useEffect(() => {
    if (opportunityId) {
      fetchCandidates(opportunityId);
    }
  }, [opportunityId]);

  const handleViewResume = (candidateId) => {
    getCandidateResume(candidateId);
  };

  if (loading) return <div>Carregando candidatos...</div>;
  if (!candidates.candidates?.length) return <div>Nenhum candidato encontrado.</div>;

  return (
    <div className="candidates-container">
      <h2>Candidatos para: {candidates.opportunity.title}</h2>
      <p>Total: {candidates.totalCandidates} candidatos</p>
      
      <div className="candidates-grid">
        {candidates.candidates.map(item => (
          <div key={item.candidatureId} className="candidate-card">
            <div className="candidate-header">
              <img src={item.candidate.photoUrl} alt={item.candidate.name} />
              <div>
                <h3>{item.candidate.name}</h3>
                <p>{item.candidate.email}</p>
                <small>Candidatou-se: {new Date(item.candidatureDate).toLocaleDateString()}</small>
              </div>
            </div>
            
            {item.candidate.profile && (
              <div className="candidate-info">
                <p><strong>Telefone:</strong> {item.candidate.profile.phoneNumber}</p>
                
                <div className="skills">
                  <strong>Habilidades:</strong>
                  {item.candidate.profile.skills.map(skill => (
                    <span key={skill} className="skill-tag">{skill}</span>
                  ))}
                </div>
                
                <div className="actions">
                  {item.candidate.profile.hasResume ? (
                    <button 
                      className="btn-primary"
                      onClick={() => handleViewResume(item.candidate.id)}
                    >
                      📄 Ver Currículo PDF
                    </button>
                  ) : (
                    <span className="no-resume">Sem currículo cadastrado</span>
                  )}
                  
                  <button 
                    className="btn-secondary"
                    onClick={() => {/* Ver perfil completo */}}
                  >
                    👤 Ver Perfil Completo
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
```

### CSS Sugerido
```css
.candidates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.candidate-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 16px;
  background: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.candidate-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.candidate-header img {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
}

.skills {
  margin: 8px 0;
}

.skill-tag {
  background: #e3f2fd;
  color: #1976d2;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  margin: 2px;
  display: inline-block;
}

.actions {
  margin-top: 12px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.btn-primary {
  background: #4caf50;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.btn-secondary {
  background: #2196f3;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.no-resume {
  color: #666;
  font-style: italic;
  font-size: 14px;
}
```

---

## 🎯 Fluxo de Uso

1. **RH acessa a lista de oportunidades** → escolhe uma vaga
2. **Sistema carrega candidatos** via `GET /opportunities/:id/candidates`
3. **RH vê lista resumida** com nome, email, skills e botão "Ver PDF"
4. **RH clica em "Ver Currículo"** → chama `GET /users/profile/:candidateId/resume`
5. **Sistema abre PDF** em nova aba para visualização
6. **Opcionalmente ver perfil completo** com experiências e educação

## ✅ Vantagens desta Abordagem

- **Performance melhorada**: Lista inicial carrega apenas dados essenciais
- **Acesso direto ao PDF**: Botão específico para visualizar currículo
- **UX otimizada**: Separação clara entre lista e detalhes
- **Controle de acesso**: Validação específica para RH
- **Feedback claro**: Informa quando não há currículo disponível

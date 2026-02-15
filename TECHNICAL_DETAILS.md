# Intern Time Tracker - Documentazione Tecnica

Questo documento fornisce un approfondimento sull'architettura tecnica, le decisioni di design e i dettagli di implementazione dell'applicazione Intern Time Tracker.

---

## 🏗️ Architettura del Sistema

L'applicazione segue una classica **architettura Client-Server Full-stack**:

- **Frontend**: Una moderna Single Page Application (SPA) costruita con React e Vite.
- **Backend**: Una RESTful API costruita con Node.js ed Express.
- **Database**: MySQL (tramite `mysql2`) per la persistenza di utenti, aziende e record di presenza.
- **Autenticazione**: Autenticazione stateless basata su JWT (JSON Web Tokens).

---

## 💻 Stack Tecnico Frontend

### Framework Core
- **React (v18)**: Libreria UI basata su componenti.
- **Vite**: Strumento di build e server di sviluppo ultra-veloce.
- **TypeScript**: Utilizzato in tutto il frontend per la sicurezza dei tipi e una migliore esperienza di sviluppo.

### Gestione dello Stato
- **React Context API**: Il file `AuthContext.tsx` gestisce lo stato globale dell'applicazione, inclusi:
  - Stato di autenticazione dell'utente.
  - Liste di tutti gli utenti e record di presenza (altamente ottimizzate per il filtraggio).
  - Chiamate API centralizzate per la sincronizzazione dei dati.
- **React Query**: Utilizzato in viste complesse come `AdminRegistry` per il recupero efficiente dei dati e il caching.

### UI & Styling
- **Tailwind CSS**: Framework CSS utility-first per uno styling rapido.
- **Shadcn/UI**: Una collezione di componenti riutilizzabili costruiti con Radix UI e Tailwind.
- **Lucide React**: Libreria di icone per un linguaggio visivo coerente.
- **Recharts**: Libreria di grafici ottimizzata per le performance, utilizzata per le statistiche del Calendario.

### Sistema di Layout (Responsività Avanzata)
Il layout principale (`DashboardLayout.tsx`) utilizza un design unico **basato sulla Viewport**:
- Le unità `h-[100dvh]` e `vh` sono utilizzate per garantire che l'applicazione si adatti perfettamente a qualsiasi schermo senza scrolling indesiderato.
- Sidebar Responsiva: Si contrae in una barra inferiore o in un header mobile sui dispositivi piccoli.
- CSS Grid & Flexbox: Utilizzati estensivamente per l'allineamento fluido.

---

## ⚙️ Stack Tecnico Backend

### Layer API
- **Express.js (v5)**: Framework web minimalista per Node.js.
- **Architettura Middleware**:
  - `cors`: Configurato con controlli rigorosi sull'origine.
  - `helmet`: Migliora la sicurezza delle API (configurato per la condivisione di risorse `cross-origin` per consentire il caricamento delle foto del profilo).
  - `express-rate-limit`: Previene gli attacchi brute-force limitando il numero di richieste per IP.
  - `jsonwebtoken`: Gestisce la generazione e la verifica dei token.

### Dati & File
- **MySQL**: Database relazionale per dati strutturati.
- **Multer**: Middleware per la gestione di `multipart/form-data`, utilizzato per l'upload delle foto del profilo.
- **ExcelJS**: Utilizzato per generare report Excel professionali nelle viste di Esportazione e Admin.

---

## 🔐 Pattern Tecnici Chiave

### 1. Logica delle Presenze
Il sistema delle presenze utilizza un tipo `AttendanceStatus`: `present` (presente), `late` (in ritardo) o `absent` (assente).
- Il tracciamento del tempo è diviso in `morningStart/End` (inizio/fine mattina) e `afternoonStart/End` (inizio/fine pomeriggio).
- I dati sono memorizzati in una tabella `records` indicizzata per `date` e `userId`.

### 2. Pattern di Sicurezza
- **Hashing delle Password**: Le password vengono criptate in modo sicuro usando `bcryptjs` prima della memorizzazione.
- **Rotte Protette**: Le rotte del frontend sono protette da una logica di componenti high-order in `App.tsx` che controlla lo stato di `AuthContext`.
- **Sicurezza API**: Tutti gli endpoint delle presenze e degli utenti richiedono un token JWT `Bearer` valido nell'header della richiesta.

### 3. Costanti Responsive
Il progetto utilizza un file `constants.ts` centralizzato per:
- Slot temporali standardizzati.
- Configurazioni di stato (colori, etichette).
- Metadati aziendali.

---

## 📂 Struttura del Progetto

```text
├── src/                # Sorgente Frontend
│   ├── components/     # Componenti UI & Layout Dashboard
│   ├── contexts/       # Auth & Stato Globale
│   ├── lib/            # Utility, Config API, Costanti
│   ├── pages/          # Componenti delle singole viste
│   └── App.tsx         # Entry point principale & Routing
├── server/             # Sorgente Backend
│   ├── controllers/    # Logica API
│   ├── routes/         # Definizioni degli Endpoint
│   ├── services/       # Servizi Email & Helper
│   └── index.js        # Entry point del Server
├── public/             # Asset Statici
└── PROGRESS.md         # Milestone del Progetto (in italiano)
```

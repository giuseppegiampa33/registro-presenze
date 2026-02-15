# Guida all'Avvio del Progetto - Intern Time Tracker

Questa guida spiega come configurare, avviare e riavviare i componenti dell'applicazione (Frontend e Backend) per lo sviluppo locale.

---

## 🛠️ Prerequisiti

Assicurati di avere installato:
1.  **Node.js** (versione 18 o superiore)
2.  **MySQL Server** (attivo e con il database configurato)
3.  **npm** (installato automaticamente con Node.js)

---

## 🚀 Come Avviare il Progetto

Il progetto è diviso in due parti che devono essere avviate **contemporaneamente** in due terminali separati.

### 1. Avviare il Backend (Server)
Il backend gestisce la connessione al database e le API.

1.  Apri un terminale nella cartella `server/`.
2.  Assicurati che le dipendenze siano installate (solo la prima volta):
    ```bash
    npm install
    ```
3.  Controlla che il file `.env` sia configurato con le credenziali del tuo database MySQL.
4.  Avvia il server in modalità sviluppo:
    ```bash
    npm run dev
    ```
    *Il server sarà attivo su `http://localhost:3000`.*

### 2. Avviare il Frontend (Client)
Il frontend è l'interfaccia utente visibile nel browser.

1.  Apri un **nuovo terminale** nella cartella principale del progetto (`intern-time-tracker-main/`).
2.  Assicurati che le dipendenze siano installate (solo la prima volta):
    ```bash
    npm install
    ```
3.  Avvia il client in modalità sviluppo:
    ```bash
    npm run dev
    ```
    *L'applicazione sarà accessibile su `http://localhost:8080`

---

## 🔄 Come Riavviare i Processi

### Riavvio del Backend
Il backend utilizza `nodemon`, il che significa che **si riavvia automaticamente** ogni volta che salvi una modifica a un file JavaScript nel server.

Se desideri riavviarlo manualmente:
1.  Vai nel terminale dove sta girando il server.
2.  Premi `Ctrl + C` per fermarlo.
3.  Digita di nuovo `npm run dev`.

### Riavvio del Frontend
Il frontend utilizza Vite con HMR (Hot Module Replacement), quindi le modifiche appaiono istantaneamente nel browser senza bisogno di riavviare.

Se l'interfaccia sembra bloccata:
1.  Aggiorna semplicemente la pagina del browser (`F5`).
2.  Se il terminale si blocca: premi `Ctrl + C` e digita `npm run dev`.

---

## ⚠️ Risoluzione dei Problemi (Troubleshooting)

-   **Errore di connessione al Database**: Verifica che MySQL sia attivo e che la password nel file `server/.env` sia corretta.
-   **Porta già in uso**: Se ricevi un errore "Port 3000 is already in use", significa che un vecchio processo è ancora attivo. Chiudi tutti i terminali o riavvia il computer per liberare le porte.
-   **Schermata Bianca nel Browser**: Apri la console del browser (tasto destro -> Ispeziona -> Console) per vedere se ci sono errori JavaScript o se il backend non risponde.

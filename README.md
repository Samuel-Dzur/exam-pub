# Hospoda Díra

Projekt je pouze prototyp připravený pro vývojové prostředí. Produkční nasazení nebylo cílem projektu a produkční sestavení ani vlastní Docker obrazy pro aplikaci nebyly připraveny. Funkce nebyly důkladně testovány v rozsahu potřebném pro produkční aplikaci.

## Rozsah a omezení

- Při návrhu API jsem vycházel ze zadaných endpointů, některé jsem však upravil. Některé endpointy se v aplikaci nepoužívají, ale zůstaly zachovány.
- Datový model počítá s budoucí historií změn cen, ale správa cen nemá vlastní API ani uživatelské rozhraní. Endpoint `/summary/all` nepodporuje souhrn objednávek rozdělený podle historických cen.
- Jedna objednávka může obsahovat pouze jeden druh nápoje.
- Součástí řešení nejsou automatizované testy, podpora mobilního zobrazení ani lokalizace frontendu do dalších jazyků.

## Komponenty a porty

| Komponenta | Port |
|---|---:|
| Frontend | `3000` |
| Backend | `8081` |
| Keycloak | `8080` |
| PostgreSQL | `5432` |

Vývojové přihlašovací údaje k PostgreSQL jsou `postgres` / `postgres`. Databáze `application` slouží backendu a databáze `keycloak` Keycloaku.

## Spuštění vývojového prostředí

Je potřeba mít nainstalovaný Docker s podporou Docker Compose. V kořenové složce projektu spusťte:

```bash
./start-development.sh
```

Služby a databáze se při prvním spuštění inicializují. Zprovoznění frontendu může chvíli trvat; stránku proto obnovujte pomocí `Ctrl+F5`, dokud se nenačte. Poté můžete aplikaci používat. Frontend je dostupný na [http://localhost:3000](http://localhost:3000), Keycloak na [http://localhost:8080](http://localhost:8080).

Prostředí používá vývojovou konfiguraci a přihlašovací údaje určené pouze pro lokální vývoj.

### Keycloak

Vývojový realm `application` se při prvním spuštění importuje ze souborů v `keycloak/import/`. Import proběhne pouze tehdy, pokud realm v databázi Keycloaku ještě neexistuje. Pozdější změny exportu již existující realm automaticky nepřepíší.

Pro přihlášení do administrační konzole Keycloaku v realm `master` použijte `admin` / `admin`. V aplikaci je přednastaven účet výčepního: `bartender` / `Bartender1#`. Zákazníci si účet vytvoří registrací přímo v aplikaci a po registraci získají počáteční kredit 800 Kč.

## Zastavení

```bash
./stop-development.sh
```

Skript zastaví kontejnery, ale zachová data databáze.

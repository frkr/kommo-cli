#!/usr/bin/env -S deno run --allow-env --allow-net --allow-read

import {env, headers, urlmake, onlyNumbers, getUniqueListBy} from "./belt.ts";
import directive from "./scli.ts";

async function contacts(env, ...args) {
    const url = urlmake(env, ["contacts"].concat(...args));
    const resp = await fetch(url, {headers});

    console.log("OLA", await resp.text());

}

async function list(env, ...args) {
    const url = urlmake(env, ["contacts"]);
    const resp = await fetch(url + "?query=" + args.join(), {headers});

    console.log("OLA", await resp.text());

}

const contactsCache = [];

async function listAll(env, ...args) {
    const page = args[0] || 1;
    const url = urlmake(env, ["contacts"]);

    const resp = await fetch(url + `?limit=250&page=${page}`, {headers});

    const content = await resp.json();
    let hasNext = null;
    try {
        hasNext = content['_links']['next']['href'];
    } catch (e) {
    }

    content['_embedded']['contacts'].forEach(c => {
        if (c['custom_fields_values'] && c['custom_fields_values'].length > 0) {
            c['custom_fields_values'].forEach(cf => {
                if (cf && cf['values'] && cf['values'].length > 0) {
                    cf['values'].forEach(v => {

                        let num = onlyNumbers(v['value']);
                        if (!num.startsWith("55")) {
                            num = "55" + num;
                        }

                        contactsCache.push({
                            nome: c['name'].replaceAll(/[^[A-z][a-z ]/g, '').trim(),
                            curto: c['name'].replaceAll(/[^[A-z][a-z ]/g, '').split(' ')[0].trim(),
                            celular: num.trim()
                        });
                    });
                }
            });
        }
    });

    if (hasNext) {
        await listAll(env, page + 1);
    }

}

async function link(env, ...args) {
    const url = urlmake(env, ["contacts"].concat([args[0]].concat(["link"])));
    console.log('OLA', args[1], url);

    const request = [{
        to_entity_id: Number.parseInt(args[1]),
        to_entity_type: "contacts" // Nao funciona com "contacts" => "contacts"
    }];

    console.log('OLA', request);

    const resp = await fetch(url, {
        method: "POST",
        body: JSON.stringify(request),
        headers
    });

    console.log("OLA", await resp.text());
}

//region Directives

const main = new directive("kcli", "Kommo CLI")
    .setEnv(env)
    .addContext(new directive("contact", 'Get Contact by ID', contacts))
    .addContext(new directive("list", 'List Contact', list))
    .addContext(new directive("listAll", 'List ALL Contact', listAll))
    .addContext(new directive("link", 'Link Contact', link))

//endregion

// await main.execute();
// await main.execute("link", "18321652", "19150014");
// await main.execute("contact", "18321652");
// await main.execute("listAll");

// getUniqueListBy(contactsCache, "celular").forEach(c => {
//     console.log(`"${c['curto'].trim()}";"${c['nome'].trim()}"; "${c['celular'].trim()}"`);
// });

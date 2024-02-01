import YAML from 'yaml';

export const hello = {
    "title": "Hello world with a variable to call into a model",
    "prompts": [
        "Hello,",
        {
            "model": "ibm/granite-20b-code-instruct-v1",
            "decoding": "greedy",
            "stop_sequences": [
                "!"
            ],
            "include_stop_sequences": true,
            "result": "World!"
        },
        "\n"
    ],
    "result": "Hello, World!\n"
}

export const weather = { "title": "Using a weather API and LLM to make a small weather app", "assign": null, "show_result": true, "result": "\nAnswer: The weather in Madrid is sunny with a temperature of 11\u00b0C (51\u00b0F).", "prompts": [{ "title": null, "assign": "QUERY", "show_result": false, "result": "What is the weather in Madrid?", "lan": "python", "code": ["result = input(\"How can I help you?: \")\n"] }, { "title": null, "assign": "LOCATION", "show_result": false, "result": "\nMadrid\n", "model": "ibm/granite-20b-code-instruct-v1", "input": { "title": null, "assign": null, "show_result": true, "result": "Question: What is the weather in London?\nLondon\nQuestion: What's the weather in Paris?\nParis\nQuestion: Tell me the weather in Lagos?\nLagos\nQuestion: What is the weather in Madrid?", "prompts": ["Question: What is the weather in London?\nLondon\nQuestion: What's the weather in Paris?\nParis\nQuestion: Tell me the weather in Lagos?\nLagos\nQuestion: ", { "title": null, "assign": null, "show_result": true, "result": "What is the weather in Madrid?", "get": "QUERY" }] }, "decoding": "argmax", "stop_sequences": ["Question", "What", "!"], "include_stop_sequences": false, "params": null }, { "title": null, "assign": "WEATHER", "show_result": false, "result": "{'location': {'name': 'Madrid', 'region': 'Madrid', 'country': 'Spain', 'lat': 40.4, 'lon': -3.68, 'tz_id': 'Europe/Madrid', 'localtime_epoch': 1706718320, 'localtime': '2024-01-31 17:25'}, 'current': {'last_updated_epoch': 1706717700, 'last_updated': '2024-01-31 17:15', 'temp_c': 11.0, 'temp_f': 51.8, 'is_day': 1, 'condition': {'text': 'Sunny', 'icon': '//cdn.weatherapi.com/weather/64x64/day/113.png', 'code': 1000}, 'wind_mph': 4.3, 'wind_kph': 6.8, 'wind_degree': 120, 'wind_dir': 'ESE', 'pressure_mb': 1033.0, 'pressure_in': 30.5, 'precip_mm': 0.0, 'precip_in': 0.0, 'humidity': 76, 'cloud': 0, 'feelslike_c': 11.4, 'feelslike_f': 52.4, 'vis_km': 9.0, 'vis_miles': 5.0, 'uv': 4.0, 'gust_mph': 8.7, 'gust_kph': 14.0}}", "api": "https", "url": "https://api.weatherapi.com/v1/current.json?key=cf601276764642cb96224947230712&q=", "input": { "title": null, "assign": null, "show_result": true, "result": "\nMadrid\n", "get": "LOCATION" } }, { "title": null, "assign": null, "show_result": true, "result": "\nAnswer: The weather in Madrid is sunny with a temperature of 11\u00b0C (51\u00b0F).", "model": "ibm/granite-20b-code-instruct-v1", "input": { "title": null, "assign": null, "show_result": true, "result": "Explain what the weather is from the following JSON:\n```\n{'location': {'name': 'Madrid', 'region': 'Madrid', 'country': 'Spain', 'lat': 40.4, 'lon': -3.68, 'tz_id': 'Europe/Madrid', 'localtime_epoch': 1706718320, 'localtime': '2024-01-31 17:25'}, 'current': {'last_updated_epoch': 1706717700, 'last_updated': '2024-01-31 17:15', 'temp_c': 11.0, 'temp_f': 51.8, 'is_day': 1, 'condition': {'text': 'Sunny', 'icon': '//cdn.weatherapi.com/weather/64x64/day/113.png', 'code': 1000}, 'wind_mph': 4.3, 'wind_kph': 6.8, 'wind_degree': 120, 'wind_dir': 'ESE', 'pressure_mb': 1033.0, 'pressure_in': 30.5, 'precip_mm': 0.0, 'precip_in': 0.0, 'humidity': 76, 'cloud': 0, 'feelslike_c': 11.4, 'feelslike_f': 52.4, 'vis_km': 9.0, 'vis_miles': 5.0, 'uv': 4.0, 'gust_mph': 8.7, 'gust_kph': 14.0}}```\n", "prompts": ["Explain what the weather is from the following JSON:\n```\n", { "title": null, "assign": null, "show_result": true, "result": "{'location': {'name': 'Madrid', 'region': 'Madrid', 'country': 'Spain', 'lat': 40.4, 'lon': -3.68, 'tz_id': 'Europe/Madrid', 'localtime_epoch': 1706718320, 'localtime': '2024-01-31 17:25'}, 'current': {'last_updated_epoch': 1706717700, 'last_updated': '2024-01-31 17:15', 'temp_c': 11.0, 'temp_f': 51.8, 'is_day': 1, 'condition': {'text': 'Sunny', 'icon': '//cdn.weatherapi.com/weather/64x64/day/113.png', 'code': 1000}, 'wind_mph': 4.3, 'wind_kph': 6.8, 'wind_degree': 120, 'wind_dir': 'ESE', 'pressure_mb': 1033.0, 'pressure_in': 30.5, 'precip_mm': 0.0, 'precip_in': 0.0, 'humidity': 76, 'cloud': 0, 'feelslike_c': 11.4, 'feelslike_f': 52.4, 'vis_km': 9.0, 'vis_miles': 5.0, 'uv': 4.0, 'gust_mph': 8.7, 'gust_kph': 14.0}}", "get": "WEATHER" }, "```\n"] }, "decoding": "argmax", "stop_sequences": ["What", "!"], "include_stop_sequences": false, "params": null }] }

export const arith = { "title": "Arithmetic Expressions", "assign": null, "show_result": true, "result": "Question: Noah charges $60 for a large painting and $30 for a small painting.\nLast month he sold eight large paintings and four small paintings.\nIf he sold twice as much this month, how much is his sales for this month?\n\nAnswer: Let's think step by step.\nHe sold 8 large paintings and 4 small paintings last month.\nHe sold twice as many this month.\n8 large paintings x $60 = << 8*60= 480 >> 480\n4 small paintings x $30 = << 4*30= 120 >> 120\nSo he sold << 480+120= 600 >> 600 paintings last month.\nTherefore he sold << 600*2= 1200 >> this month.\nThe answer is $1200.\n\nQuestion: Noah charges $30 for a large vases and $10 for a small vases.\nLast month he sold five large vases and three small vases.\nIf he sold three times as much this month, how much is his sales for this month?\n\nAnswer: Let's think step by step.\nHe sold 5 large vases and 3 small vases last month.\nHe sold three times as many this month.\n5 large vases x $30 = << 5*30= 150 >> 150\n3 small vases x $10 = << 3*10= 30 >> 30\nSo he sold << 150+30= 180 >> 180 vases last month.\nTherefore he sold << 180*3= 540 >> this month.\nThe answer is $540.\n\nQuestion: \nNoah charges $10 for a large cups and $5 for a small cups.\nLast month he sold six large cups and two small cups.\nIf he sold twice as much this month, how much is his sales for this month?\n\nAnswer: Let's think step by step.\nHe sold 6 large cups and 2 small cups last month.\nHe sold twice as many this month.\n6 large cups x $10 = << 6*10= 60 >> 60\n2 small cups x $5 = << 2*5= 10 >> 10\nSo he sold << 60+10= 70 >> 70 cups last month.\nTherefore he sold << 70*2= 140 >> this month.\nThe answer is $140.\n\nQuestion: \nNoah charges $10 for a large boxes and $5 for a small boxes.\nLast month he sold seven large boxes and one small boxes.\nIf he sold three times as much this month, how much is his sales for this month?\n\nAnswer: Let's think step by step.\nHe sold 7 large boxes and 1 small boxes last month.\nHe sold three times as many this month.\n7 large boxes x $10 = << 7*10= 70 >> 70\n1 small boxes x $5 = << 1*5= 5 >> 5\nSo he sold << 70+5= 75 >> 75 boxes last month.\nTherefore he sold << 75*3= 225 >> this month.\nThe answer is $225.\n\nQuestion: \nNoah charges $10 for a large pens and $5 for a small pens.\nLast month he sold nine large pens and seven small pens.\nIf he sold three times as much this month, how much is his sales for this month?\n\nAnswer: Let's think step by step.\nHe sold 9 large pens and 7 small pens last month.\nHe sold three times as many this month.\n9 large pens x $10 = << 9*10= 90 >> 90\n7 small pens x $5 = << 7*5= 35 >> 35\nSo he sold << 90+35= 125 >> 125 pens last month.\nTherefore he sold << 125*3= 375 >> this month.\nThe answer is $375.\n\n", "prompts": ["Question: Noah charges $60 for a large painting and $30 for a small painting.\n", "Last month he sold eight large paintings and four small paintings.\n", "If he sold twice as much this month, how much is his sales for this month?\n", "\n", "Answer: Let's think step by step.\n", "He sold 8 large paintings and 4 small paintings last month.\n", "He sold twice as many this month.\n", "8 large paintings x $60 = << 8*60= 480 >> 480\n", "4 small paintings x $30 = << 4*30= 120 >> 120\n", "So he sold << 480+120= 600 >> 600 paintings last month.\n", "Therefore he sold << 600*2= 1200 >> this month.\n", "The answer is $1200.\n", "\n", "Question: Noah charges $30 for a large vases and $10 for a small vases.\n", "Last month he sold five large vases and three small vases.\n", "If he sold three times as much this month, how much is his sales for this month?\n", "\n", "Answer: Let's think step by step.\n", "He sold 5 large vases and 3 small vases last month.\n", "He sold three times as many this month.\n", "5 large vases x $30 = << 5*30= 150 >> 150\n", "3 small vases x $10 = << 3*10= 30 >> 30\n", "So he sold << 150+30= 180 >> 180 vases last month.\n", "Therefore he sold << 180*3= 540 >> this month.\n", "The answer is $540.\n\n", { "title": null, "assign": null, "show_result": true, "result": "Question: \nNoah charges $10 for a large cups and $5 for a small cups.\nLast month he sold six large cups and two small cups.\nIf he sold twice as much this month, how much is his sales for this month?\n\nAnswer: Let's think step by step.\nHe sold 6 large cups and 2 small cups last month.\nHe sold twice as many this month.\n6 large cups x $10 = << 6*10= 60 >> 60\n2 small cups x $5 = << 2*5= 10 >> 10\nSo he sold << 60+10= 70 >> 70 cups last month.\nTherefore he sold << 70*2= 140 >> this month.\nThe answer is $140.\n\nQuestion: \nNoah charges $10 for a large boxes and $5 for a small boxes.\nLast month he sold seven large boxes and one small boxes.\nIf he sold three times as much this month, how much is his sales for this month?\n\nAnswer: Let's think step by step.\nHe sold 7 large boxes and 1 small boxes last month.\nHe sold three times as many this month.\n7 large boxes x $10 = << 7*10= 70 >> 70\n1 small boxes x $5 = << 1*5= 5 >> 5\nSo he sold << 70+5= 75 >> 75 boxes last month.\nTherefore he sold << 75*3= 225 >> this month.\nThe answer is $225.\n\nQuestion: \nNoah charges $10 for a large pens and $5 for a small pens.\nLast month he sold nine large pens and seven small pens.\nIf he sold three times as much this month, how much is his sales for this month?\n\nAnswer: Let's think step by step.\nHe sold 9 large pens and 7 small pens last month.\nHe sold three times as many this month.\n9 large pens x $10 = << 9*10= 90 >> 90\n7 small pens x $5 = << 7*5= 35 >> 35\nSo he sold << 90+35= 125 >> 125 pens last month.\nTherefore he sold << 125*3= 375 >> this month.\nThe answer is $375.\n\n", "prompts": ["Question: ", { "title": null, "assign": "QUESTION", "show_result": true, "result": "\nNoah charges $10 for a large pens and $5 for a small pens.\nLast month he sold nine large pens and seven small pens.\nIf he sold three times as much this month, how much is his sales for this month?\n\n", "model": "ibm/granite-20b-code-instruct-v1", "input": null, "decoding": "argmax", "stop_sequences": ["Answer"], "include_stop_sequences": false, "params": { "distribution_batch_size": 1, "max_length": 2048 } }, "Answer: Let's think step by step.\n", { "title": null, "assign": null, "show_result": true, "result": "He sold 9 large pens and 7 small pens last month.\nHe sold three times as many this month.\n9 large pens x $10 = << 9*10= 90 >> 90\n7 small pens x $5 = << 7*5= 35 >> 35\nSo he sold << 90+35= 125 >> 125 pens last month.\nTherefore he sold << 125*3= 375 >> this month.\nThe answer is $375.", "prompts": [{ "title": null, "assign": "REASON_OR_CALC", "show_result": true, "result": " this month.\nThe answer is $375.", "model": "ibm/granite-20b-code-instruct-v1", "input": null, "decoding": "argmax", "stop_sequences": ["<<"], "include_stop_sequences": true, "params": { "distribution_batch_size": 1, "max_length": 2048 } }, { "title": null, "assign": null, "show_result": true, "result": "", "prompts": [{ "title": null, "assign": "EXPR", "show_result": true, "result": " 125*3", "model": "ibm/granite-20b-code-instruct-v1", "input": null, "decoding": "argmax", "stop_sequences": ["=", "\n"], "include_stop_sequences": false, "params": { "distribution_batch_size": 1, "max_length": 2048 } }, "= ", { "title": null, "assign": "RESULT", "show_result": true, "result": "375", "lan": "python", "code": ["result = ", { "title": null, "assign": null, "show_result": true, "result": " 125*3", "get": "EXPR" }] }, " >>"], "condition": { "ends_with": { "arg0": { "title": null, "assign": null, "show_result": true, "result": " this month.\nThe answer is $375.", "get": "REASON_OR_CALC" }, "arg1": "<<" } } }], "repeats_until": { "contains": { "arg0": { "title": null, "assign": null, "show_result": true, "result": " this month.\nThe answer is $375.", "get": "REASON_OR_CALC" }, "arg1": "The answer is" } } }, "\n\n"], "repeats": 3 }] }

export const data = weather

export function show_result(data) {
    let div = document.createElement("div");
    div.classList.add("pdl_block")
    if (typeof (data) === "string") {
        div.innerHTML = data.split('\n').join('<br>')
    } else {
        if (data.hasOwnProperty("show_result") && !data.show_result) {
            div.classList.add("pdl_show_result_false")
            div.innerHTML = "☐"
        } else {
            div.innerHTML = data.result.split('\n').join('<br>')
        }
        // if (data.hasOwnProperty("assign") && data.assign !== null) {
        //     div.innerHTML = `${div.innerHTML}<sup>${data.assign}</sup>`
        // }
    }
    div.addEventListener('click', function (e) {
        div.replaceWith(show_block(data));
        if (e.stopPropagation) e.stopPropagation();
    })
    return div
}

export function show_block(data) {
    let div = document.createElement("fieldset");
    div.classList.add("pdl_block")
    div.addEventListener('click', function(e) {
        div.replaceWith(show_result(data));
        if (e.stopPropagation) e.stopPropagation();
    })
    if (data.hasOwnProperty("show_result") && !data.show_result) {
        div.classList.add("pdl_show_result_false")
    }
    div.addEventListener('mouseover', function (e) {
        show_code(data)
        if (e.stopPropagation) e.stopPropagation();
    })
    if (typeof (data) === "string") {
        div.classList.add("pdl_string")
        div.innerHTML = data.split('\n').join('<br>')
        return div
    }
    if (data.hasOwnProperty("model")) {
        div.classList.add("pdl_model")
        div.innerHTML = data.result.split('\n').join('<br>')
    } else if (data.hasOwnProperty("code")) {
        div.classList.add("pdl_code")
        div.innerHTML = data.result.split('\n').join('<br>')
    } else if (data.hasOwnProperty("api")) {
        div.classList.add("pdl_api")
        div.innerHTML = data.result.split('\n').join('<br>')
    } else if (data.hasOwnProperty("get")) {
        div.classList.add("pdl_get")
        div.innerHTML = data.result.split('\n').join('<br>')
    } else if (data.hasOwnProperty("value")) {
        div.classList.add("pdl_value")
        div.innerHTML = data.result.split('\n').join('<br>')
    } else if (data.hasOwnProperty("condition")) {
        div.classList.add("pdl_condition")
        // div.appendChild(show_result(data))
        for (const block of data.prompts) {
            let child = show_block(block)
            div.appendChild(child)
        }
    } else if (data.hasOwnProperty("repeats")) {
        div.classList.add("pdl_repeats")
        for (const block of data.prompts) {
            let child = show_block(block)
            div.appendChild(child)
        }
        // div.innerHTML = data.result.split('\n').join('<br>')
    } else if (data.hasOwnProperty("repeats_until")) {
        div.classList.add("pdl_repeats_until")
        for (const block of data.prompts) {
            let child = show_block(block)
            div.appendChild(child)
        }
        // div.innerHTML = data.result.split('\n').join('<br>')
    } else if (data.hasOwnProperty("prompts")) {
        div.classList.add("pdl_sequence")
        for (const block of data.prompts) {
            let child = show_block(block)
            div.appendChild(child)
        }
    }
    add_assign(div, data) 
    return div
}

export function add_assign(block_div, data) {
    if (!data.hasOwnProperty("assign")) {
        return block_div
    }
    if (data.assign === null) {
        return block_div
    }
    let legend =document.createElement("legend")
    legend.innerHTML = data.assign
    block_div.appendChild(legend)
}

export function show_code(data) {
    let code = document.createElement("pre");
    data = code_cleanup(data)
    code.innerHTML = YAML.stringify(data)
    // code.innerHTML = JSON.stringify(data, null, "  ")
    replace_div("code", code)
}

export function code_cleanup(data) {
    if (Array.isArray(data)) {
        data = data.map(code_cleanup)
    }
    else if (typeof (data) === 'object' && data !== null) {
        // remove result
        if (data.hasOwnProperty("result")) {
            const { result: _, ...new_data } = data
            data = new_data
        }
        // remove show_result: true
        if (data.hasOwnProperty("show_result") && data.show_result) {
            const { show_result: _, ...new_data } = data
            data = new_data
        }
        // remove null
        data = Object.entries(data).reduce((a, [k, v]) => (v === null ? a : (a[k] = v, a)), {})
        // remove show_result: true
        // recursive cleanup
        data = Object.fromEntries(Object.entries(data).map(([key, value]) => [key, code_cleanup(value)]))
    }
    return data
}

export function replace_div(id, elem) {
    let div = document.createElement("div");
    div.id = id
    div.appendChild(elem)
    document.getElementById(id).replaceWith(div)
}
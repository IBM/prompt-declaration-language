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

export const weather = {"title": "Using a weather API and LLM to make a small weather app", "assign": null, "show_result": true, "result": "What is the weather in Madrid?\nAnswer: The weather in Madrid is clear and sunny with a temperature of 6\u00b0C (42\u00b0F).", "prompts": [{"title": null, "assign": "QUERY", "show_result": true, "result": "What is the weather in Madrid?", "lan": "python", "code": ["result = input(\"How can I help you?: \")\n"]}, {"title": null, "assign": "LOCATION", "show_result": false, "result": "\nMadrid\n", "model": "ibm/granite-20b-code-instruct-v1", "input": {"title": null, "assign": null, "show_result": true, "result": "Question: What is the weather in London?\nLondon\nQuestion: What's the weather in Paris?\nParis\nQuestion: Tell me the weather in Lagos?\nLagos\nQuestion: What is the weather in Madrid?", "prompts": ["Question: What is the weather in London?\nLondon\nQuestion: What's the weather in Paris?\nParis\nQuestion: Tell me the weather in Lagos?\nLagos\nQuestion: ", {"title": null, "assign": null, "show_result": true, "result": "What is the weather in Madrid?", "get": "QUERY"}]}, "decoding": "argmax", "stop_sequences": ["Question", "What", "!"], "include_stop_sequences": false, "params": null}, {"title": null, "assign": "WEATHER", "show_result": false, "result": "{'location': {'name': 'Madrid', 'region': 'Madrid', 'country': 'Spain', 'lat': 40.4, 'lon': -3.68, 'tz_id': 'Europe/Madrid', 'localtime_epoch': 1706938388, 'localtime': '2024-02-03 6:33'}, 'current': {'last_updated_epoch': 1706938200, 'last_updated': '2024-02-03 06:30', 'temp_c': 6.0, 'temp_f': 42.8, 'is_day': 0, 'condition': {'text': 'Clear', 'icon': '//cdn.weatherapi.com/weather/64x64/night/113.png', 'code': 1000}, 'wind_mph': 2.2, 'wind_kph': 3.6, 'wind_degree': 59, 'wind_dir': 'ENE', 'pressure_mb': 1032.0, 'pressure_in': 30.47, 'precip_mm': 0.0, 'precip_in': 0.0, 'humidity': 87, 'cloud': 0, 'feelslike_c': 4.5, 'feelslike_f': 40.1, 'vis_km': 10.0, 'vis_miles': 6.0, 'uv': 1.0, 'gust_mph': 9.4, 'gust_kph': 15.1}}", "api": "https", "url": "https://api.weatherapi.com/v1/current.json?key=cf601276764642cb96224947230712&q=", "input": {"title": null, "assign": null, "show_result": true, "result": "\nMadrid\n", "get": "LOCATION"}}, {"title": null, "assign": null, "show_result": true, "result": "\nAnswer: The weather in Madrid is clear and sunny with a temperature of 6\u00b0C (42\u00b0F).", "model": "ibm/granite-20b-code-instruct-v1", "input": {"title": null, "assign": null, "show_result": true, "result": "Explain what the weather is from the following JSON:\n```\n{'location': {'name': 'Madrid', 'region': 'Madrid', 'country': 'Spain', 'lat': 40.4, 'lon': -3.68, 'tz_id': 'Europe/Madrid', 'localtime_epoch': 1706938388, 'localtime': '2024-02-03 6:33'}, 'current': {'last_updated_epoch': 1706938200, 'last_updated': '2024-02-03 06:30', 'temp_c': 6.0, 'temp_f': 42.8, 'is_day': 0, 'condition': {'text': 'Clear', 'icon': '//cdn.weatherapi.com/weather/64x64/night/113.png', 'code': 1000}, 'wind_mph': 2.2, 'wind_kph': 3.6, 'wind_degree': 59, 'wind_dir': 'ENE', 'pressure_mb': 1032.0, 'pressure_in': 30.47, 'precip_mm': 0.0, 'precip_in': 0.0, 'humidity': 87, 'cloud': 0, 'feelslike_c': 4.5, 'feelslike_f': 40.1, 'vis_km': 10.0, 'vis_miles': 6.0, 'uv': 1.0, 'gust_mph': 9.4, 'gust_kph': 15.1}}```\n", "prompts": ["Explain what the weather is from the following JSON:\n```\n", {"title": null, "assign": null, "show_result": true, "result": "{'location': {'name': 'Madrid', 'region': 'Madrid', 'country': 'Spain', 'lat': 40.4, 'lon': -3.68, 'tz_id': 'Europe/Madrid', 'localtime_epoch': 1706938388, 'localtime': '2024-02-03 6:33'}, 'current': {'last_updated_epoch': 1706938200, 'last_updated': '2024-02-03 06:30', 'temp_c': 6.0, 'temp_f': 42.8, 'is_day': 0, 'condition': {'text': 'Clear', 'icon': '//cdn.weatherapi.com/weather/64x64/night/113.png', 'code': 1000}, 'wind_mph': 2.2, 'wind_kph': 3.6, 'wind_degree': 59, 'wind_dir': 'ENE', 'pressure_mb': 1032.0, 'pressure_in': 30.47, 'precip_mm': 0.0, 'precip_in': 0.0, 'humidity': 87, 'cloud': 0, 'feelslike_c': 4.5, 'feelslike_f': 40.1, 'vis_km': 10.0, 'vis_miles': 6.0, 'uv': 1.0, 'gust_mph': 9.4, 'gust_kph': 15.1}}", "get": "WEATHER"}, "```\n"]}, "decoding": "argmax", "stop_sequences": ["What", "!"], "include_stop_sequences": false, "params": null}]}

export const data = weather

export function show_result(data) {
    let div = document.createElement("div");
    div.classList.add("pdl_block")
    if (typeof (data) === "string") {
        div.innerHTML = htmlize(data)
    } else {
        if (data.hasOwnProperty("show_result") && !data.show_result) {
            div.classList.add("pdl_show_result_false")
            div.innerHTML = "☐"
        } else {
            div.innerHTML = htmlize(data.result)
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
    div.addEventListener('click', function (e) {
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
        div.innerHTML = htmlize(data)
        return div
    }
    if (data.hasOwnProperty("model")) {
        div.classList.add("pdl_model")
        div.innerHTML = htmlize(data.result)
    } else if (data.hasOwnProperty("code")) {
        div.classList.add("pdl_code")
        div.innerHTML = htmlize(data.result)
    } else if (data.hasOwnProperty("api")) {
        div.classList.add("pdl_api")
        div.innerHTML = htmlize(data.result)
    } else if (data.hasOwnProperty("get")) {
        div.classList.add("pdl_get")
        div.innerHTML = htmlize(data.result)
    } else if (data.hasOwnProperty("value")) {
        div.classList.add("pdl_value")
        div.innerHTML = htmlize(data.result)
    } else if (data.hasOwnProperty("condition")) {
        div.classList.add("pdl_condition")
        // div.appendChild(show_result(data))
        for (const block of data.prompts) {
            let child = show_block(block)
            div.appendChild(child)
        }
        if (data.condition.hasOwnProperty("result") && !data["condition"]["result"]) {
            div.classList.add("pdl_show_result_false")
        }
    } else if (data.hasOwnProperty("repeats")) {
        div.classList.add("pdl_repeats")
        let body = show_loop_trace(data.trace)
        div.appendChild(body)
    } else if (data.hasOwnProperty("repeats_until")) {
        div.classList.add("pdl_repeats_until")
        let body = show_loop_trace(data.trace)
        div.appendChild(body)
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

export function show_prompts(prompts) {
    let doc_fragment = document.createDocumentFragment()
    for (const block of prompts) {
        let child = show_block(block)
        doc_fragment.appendChild(child)
    }
    return doc_fragment
}

export function show_loop_trace(trace) {
    let doc_fragment = document.createDocumentFragment()
    if (trace.length > 1) {
        let dot_dot_dot = document.createElement("div")
        dot_dot_dot.innerHTML = "···"
        dot_dot_dot.addEventListener('click', function (e) {
            dot_dot_dot.replaceWith(show_loop_trace(trace.slice(0, -1)));
            if (e.stopPropagation) e.stopPropagation();
        })
        doc_fragment.appendChild(dot_dot_dot)
    }
    if (trace.length > 0) {
        let iteration = document.createElement("div")
        iteration.classList.add("pdl_block", "pdl_sequence")
        let child = show_prompts(trace.slice(-1)[0])
        iteration.appendChild(child)
        doc_fragment.appendChild(iteration)
    }
    return doc_fragment
}

export function add_assign(block_div, data) {
    if (!data.hasOwnProperty("assign")) {
        return block_div
    }
    if (data.assign === null) {
        return block_div
    }
    let legend = document.createElement("legend")
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

export function htmlize(s) {
    s = s || ""
    let html = (s === "") ? "☐" : s.split('\n').join('<br>')
    return html
}

import YAML from 'yaml';

export const hello = {
    "description": "Hello world with a call into a model",
    "document": [
        "Hello,",
        {
            "model": "ibm/granite-20b-code-instruct-v1",
            "parameters": {
                "decoding_method": "greedy",
                "stop_sequences": [
                    "!"
                ],
                "include_stop_sequence": true,
            },
            "result": "World!"
        },
        "\n"
    ],
    "result": "Hello, World!\n"
}

export const weather = {
  "description": "Using a weather API and LLM to make a small weather app",
  "document": [
    {
      "filename": null,
      "stdin": true,
      "message": "Ask a query: ",
      "multiline": false,
      "json_content": false,
      "def": "QUERY",
      "result": "What is the weather in Madrid?"
    },
    {
      "model": "ibm/granite-20b-code-instruct-v1",
      "input": {
        "document": [
          "Question: What is the weather in London?\nLondon\nQuestion: What's the weather in Paris?\nParis\nQuestion: Tell me the weather in Lagos?\nLagos\nQuestion: ",
          {
            "get": "QUERY",
            "result": "What is the weather in Madrid?"
          }
        ],
        "result": "Question: What is the weather in London?\nLondon\nQuestion: What's the weather in Paris?\nParis\nQuestion: Tell me the weather in Lagos?\nLagos\nQuestion: What is the weather in Madrid?"
      },
      "decoding_method": "greedy",
      "stop_sequences": [
        "Question",
        "What",
        "!"
      ],
      "def": "LOCATION",
      "show_result": false,
      "result": "\nMadrid\n"
    },
    {
      "api": "https",
      "url": "https://api.weatherapi.com/v1/current.json?key=cf601276764642cb96224947230712&q=",
      "input": {
        "get": "LOCATION",
        "result": "\nMadrid\n"
      },
      "def": "WEATHER",
      "show_result": false,
      "result": "{'location': {'name': 'Madrid', 'region': 'Madrid', 'country': 'Spain', 'lat': 40.4, 'lon': -3.68, 'tz_id': 'Europe/Madrid', 'localtime_epoch': 1708050435, 'localtime': '2024-02-16 3:27'}, 'current': {'last_updated_epoch': 1708049700, 'last_updated': '2024-02-16 03:15', 'temp_c': 9.0, 'temp_f': 48.2, 'is_day': 0, 'condition': {'text': 'Clear', 'icon': '//cdn.weatherapi.com/weather/64x64/night/113.png', 'code': 1000}, 'wind_mph': 6.9, 'wind_kph': 11.2, 'wind_degree': 260, 'wind_dir': 'W', 'pressure_mb': 1019.0, 'pressure_in': 30.09, 'precip_mm': 0.01, 'precip_in': 0.0, 'humidity': 87, 'cloud': 0, 'feelslike_c': 6.0, 'feelslike_f': 42.9, 'vis_km': 10.0, 'vis_miles': 6.0, 'uv': 1.0, 'gust_mph': 20.7, 'gust_kph': 33.3}}"
    },
    {
      "model": "ibm/granite-20b-code-instruct-v1",
      "input": {
        "document": [
          "Explain what the weather is from the following JSON:\n```\n",
          {
            "get": "WEATHER",
            "result": "{'location': {'name': 'Madrid', 'region': 'Madrid', 'country': 'Spain', 'lat': 40.4, 'lon': -3.68, 'tz_id': 'Europe/Madrid', 'localtime_epoch': 1708050435, 'localtime': '2024-02-16 3:27'}, 'current': {'last_updated_epoch': 1708049700, 'last_updated': '2024-02-16 03:15', 'temp_c': 9.0, 'temp_f': 48.2, 'is_day': 0, 'condition': {'text': 'Clear', 'icon': '//cdn.weatherapi.com/weather/64x64/night/113.png', 'code': 1000}, 'wind_mph': 6.9, 'wind_kph': 11.2, 'wind_degree': 260, 'wind_dir': 'W', 'pressure_mb': 1019.0, 'pressure_in': 30.09, 'precip_mm': 0.01, 'precip_in': 0.0, 'humidity': 87, 'cloud': 0, 'feelslike_c': 6.0, 'feelslike_f': 42.9, 'vis_km': 10.0, 'vis_miles': 6.0, 'uv': 1.0, 'gust_mph': 20.7, 'gust_kph': 33.3}}"
          },
          "```\n"
        ],
        "result": "Explain what the weather is from the following JSON:\n```\n{'location': {'name': 'Madrid', 'region': 'Madrid', 'country': 'Spain', 'lat': 40.4, 'lon': -3.68, 'tz_id': 'Europe/Madrid', 'localtime_epoch': 1708050435, 'localtime': '2024-02-16 3:27'}, 'current': {'last_updated_epoch': 1708049700, 'last_updated': '2024-02-16 03:15', 'temp_c': 9.0, 'temp_f': 48.2, 'is_day': 0, 'condition': {'text': 'Clear', 'icon': '//cdn.weatherapi.com/weather/64x64/night/113.png', 'code': 1000}, 'wind_mph': 6.9, 'wind_kph': 11.2, 'wind_degree': 260, 'wind_dir': 'W', 'pressure_mb': 1019.0, 'pressure_in': 30.09, 'precip_mm': 0.01, 'precip_in': 0.0, 'humidity': 87, 'cloud': 0, 'feelslike_c': 6.0, 'feelslike_f': 42.9, 'vis_km': 10.0, 'vis_miles': 6.0, 'uv': 1.0, 'gust_mph': 20.7, 'gust_kph': 33.3}}```\n"
      },
      "decoding_method": "greedy",
      "stop_sequences": [
        "What",
        "!"
      ],
      "result": "\nAnswer: The weather in Madrid is clear and sunny with a temperature of 9°C (48°F)."
    }
  ],
  "result": "What is the weather in Madrid?\nAnswer: The weather in Madrid is clear and sunny with a temperature of 9°C (48°F)."
}

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
        for (const block of data.document) {
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
    } else if (data.hasOwnProperty("document")) {
        div.classList.add("pdl_sequence")
        for (const block of data.document) {
            let child = show_block(block)
            div.appendChild(child)
        }
    }
    add_def(div, data)
    return div
}

export function show_document(document) {
    let doc_fragment = document.createDocumentFragment()
    for (const block of document) {
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
        let child = show_document(trace.slice(-1)[0])
        iteration.appendChild(child)
        doc_fragment.appendChild(iteration)
    }
    return doc_fragment
}

export function add_def(block_div, data) {
    if (!data.hasOwnProperty("def")) {
        return block_div
    }
    if (data.def === null) {
        return block_div
    }
    let legend = document.createElement("legend")
    legend.innerHTML = data.def
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

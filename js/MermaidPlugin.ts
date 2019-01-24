// based on https://github.com/tylingsoft/markdown-it-mermaid

import MarkdownIt from "markdown-it";
import Token from 'markdown-it/lib/token';
import mermaid from 'mermaid';

// workaround missing import in dependency
// see: https://github.com/tylingsoft/dagre-d3-renderer/pull/1
import * as d3 from 'd3';
window['d3'] = d3;

mermaid.mermaidAPI.initialize({
    startOnLoad: true,
    logLevel: 3,
    theme: 'forest'
});

let chartCounter = 0;

const mermaidChart = (code: string): string => {
    let mermaidError: string | null = null;
    mermaid.parseError = (error: string) => {
        mermaidError = error
    };
    if (mermaid.parse(code) || mermaidError === null) {
        const tempElement = document.createElement('div');
        // tempElement.classList.add('hidden');
        document.body.appendChild(tempElement);
        const graph = mermaid.mermaidAPI.render(`chart_${chartCounter++}`, code, () => {
        }, tempElement);
        document.body.removeChild(tempElement);
        if (!graph) {
            return `<pre>Error creating graph</pre>`
        }
        return `<div class="mermaid">${graph}</div>`
    } else {
        return `<pre>${mermaidError}</pre>`
    }
};

export const MermaidPlugin = (md: MarkdownIt) => {
    const originalRenderer = md.renderer.rules.fence.bind(md.renderer.rules);
    md.renderer.rules.fence = (tokens: Token[], idx: number, options, env, slf) => {
        const token = tokens[idx];
        const code = token.content.trim();
        if (token.info === 'mermaid') {
            return mermaidChart(code);
        }
        const firstLine = code.split(/\n/)[0].trim();
        if (firstLine === 'gantt' || firstLine === 'sequenceDiagram' || firstLine.match(/^graph (?:TB|BT|RL|LR|TD);?$/)) {
            return mermaidChart(code);
        }
        return originalRenderer(tokens, idx, options, env, slf);
    }
};

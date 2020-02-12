//import sum from './sub/sum';
// import 'lit-html/polyfills/template_polyfill';
import {html, render} from 'lit-html/lit-html';

class A {
    constructor(a) {
        console.log('Hello ' + a);
    }
}

new A('world!');

var h = "Hello", w = "world";
render(html`${h} ${w}!`, document.body);

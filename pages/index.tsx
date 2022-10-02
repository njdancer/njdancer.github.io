import Head from "next/head";
import { Component } from "react";
import {
  attributes,
  react as HomeContent,
} from "../content/2018-07-10-reverse-engineering-infrared-for-ac-remotes.md";

export default class Home extends Component {
  render() {
    const { title, tags } = attributes as any;

    return (
      <article>
        <h1>{title}</h1>
        <HomeContent />
        <span>Tags: {tags.join(", ")}</span>
      </article>
    );
  }
}

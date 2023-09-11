#!/usr/bin/env node
import "source-map-support/register";
import {App} from "aws-cdk-lib";
import {ApiStatefulStack} from "../lib/stateful-stack";

const app = new App();

new ApiStatefulStack(app,"StateFullStack")

app.synth();
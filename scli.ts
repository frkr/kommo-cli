/*
LICENSE: The MIT License (MIT)
Copyright Davi Saranszky Mesquita 2024
 */

export default class directive {
    private context: null | any[];
    private envDescr: null | string[];
    private env: any;

    constructor(verb: string, description: string, action?: (env, ...args) => Promise<void>) {
        this.verb = verb;
        this.description = description;
        this.action = action;
        this.context = null;
        this.envDescr = null;
        this.env = null;
    }

    public async execute(...args: any[]) {
        if (!args || args.length === 0 || args[0] === '--help') {
            this.help();
            !this.context || Object.keys(this.context).forEach((k) => this.context[k].help());
            console.log();
            !this.envDescr || console.log('ENV:', this.envDescr.join(', '));
        } else if (this.context) {
            console.log(this.verb);
            await this.context[args[0]].setEnv(this.env).execute(...args);
        } else {
            const nargs = args.slice(1);
            if (nargs.length > 0 && nargs[0] === '--help') {
                this.help();
            } else if (!this.action) {
                console.log("No action defined for", this.verb);
            } else {
                !this.action || console.log("executing", this.verb);
                !this.action || await this.action(this.env, ...nargs)
            }
        }
    }

    public addContext(context: directive) {
        if (!this.context) {
            this.context = {};
        }
        this.context[context.verb] = context;
        return this;
    }

    public setEnv(env: any) {
        if (!!env) {
            this.envDescr = Object.keys(env);
            this.env = env;
        }
        return this;
    }

    private help() {
        console.log(!!this.context ? '' : '\t', this.verb, '  ::', this.description);
    }
}

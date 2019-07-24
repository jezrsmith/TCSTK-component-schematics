"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const schematics_1 = require("@angular-devkit/schematics");
const config_1 = require("../schematics-angular-utils/config");
const schematics_utilities_1 = require("schematics-utilities");
const find_module_1 = require("../schematics-angular-utils/find-module");
const parse_name_1 = require("./parse-name");
const core_1 = require("@angular-devkit/core");
const ng_module_utils_1 = require("./ng-module-utils");
const strings_1 = require("@angular-devkit/core/src/utils/strings");
function formChain(options, type) {
    console.log('Options: ', options);
    return schematics_1.chain([
        (_tree, context) => {
            // Show the options for this Schematics.
            context.logger.info('-----------------------------------------------');
            context.logger.info('--- **  TIBCO CLOUD COMPONENT GENERATOR  ** ---');
            context.logger.info('--- **                V1.041             ** ---');
            context.logger.info('-----------------------------------------------');
            context.logger.info('--- ** TYPE: TIBCO CUSTOM FORM (' + type.toUpperCase() + ')** ---');
            context.logger.info('-----------------------------------------------');
            context.logger.info('Building TIBCO Cloud Component, with the following settings: ' + JSON.stringify(options));
            //console.log('CONTEXT:', context);
        },
        // The schematic Rule calls the schematic from the same collection, with the options
        // passed in. Please note that if the schematic has a schema, the options will be
        // validated and could throw, e.g. if a required option is missing.
        //schematic('my-other-schematic', { option: true }),
        (host, context) => {
            context.logger.log('info', "Name: " + options.name);
            context.logger.info('Adding dependencies...');
            const workspace = config_1.getWorkspace(host);
            const project = schematics_utilities_1.getProjectFromWorkspace(workspace, 
            // Takes the first project in case it's not provided by CLI
            options.project ? options.project : Object.keys(workspace['projects'])[0]);
            // updateFormRegistry(project, host, context);
            const moduleName = options.name + 'Component';
            const sourceLoc = './custom-forms/' + options.name + '/' + options.name + '.component';
            context.logger.info('moduleName: ' + moduleName);
            context.logger.info('sourceLoc: ' + sourceLoc);
            context.logger.info('Project Root: ' + project.root);
            if (!options.project) {
                options.project = Object.keys(workspace.projects)[0];
            }
            if (options.path === undefined) {
                const projectDirName = project.projectType === 'application' ? 'app' : 'lib';
                options.path = `/${project.root}/src/${projectDirName}`;
            }
            options.module = find_module_1.findModuleFromOptions(host, options);
            const moduleNameNew = options.name + '-' + type + '-form';
            const parsedPath = parse_name_1.parseName(options.path + '/custom-forms/', moduleNameNew);
            console.log('parsedPath: ', parsedPath);
            options.name = parsedPath.name;
            context.logger.info('options.name: ' + options.name);
            options.path = parsedPath.path;
            context.logger.info('options.path: ' + options.path);
            options.export = false;
            // context.logger.info('Adding declaration: ' + options.export);
            options.type = type;
            console.warn('Options: ', options);
            // context.logger.info('Installed Dependencies...');
        },
        // The mergeWith() rule merge two trees; one that's coming from a Source (a Tree with no
        // base), and the one as input to the rule. You can think of it like rebasing a Source on
        // top of your current set of changes. In this case, the Source is that apply function.
        // The apply() source takes a Source, and apply rules to it. In our case, the Source is
        // url(), which takes an URL and returns a Tree that contains all the files from that URL
        // in it. In this case, we use the relative path `./files`, and so two files are going to
        // be created (test1, and __name@dasherize__.md).
        // We then apply the template() rule, which takes a tree and apply two templates to it:
        //   path templates: this template replaces instances of __X__ in paths with the value of
        //                   X from the options passed to template(). If the value of X is a
        //                   function, the function will be called. If the X is undefined or it
        //                   returns null (not empty string), the file or path will be removed.
        //   content template: this is similar to EJS, but does so in place (there's no special
        //                     extension), does not support additional functions if you don't pass
        //                     them in, and only work on text files (we use an algorithm to detect
        //                     if a file is binary or not).
        schematics_1.mergeWith(schematics_1.apply(schematics_1.url('./files'), [
            schematics_1.template(Object.assign({}, core_1.strings, { INDEX: options.index, name: options.name })),
        ])),
        ng_module_utils_1.addDeclarationToNgModule(options, false),
        ng_module_utils_1.addEntryPointToNgModule(options),
        () => {
            options.module = options.module.replace('.ts', '.dev');
            console.warn('Options (DEV): ', options);
        },
        ng_module_utils_1.addDeclarationToNgModule(options, false),
        ng_module_utils_1.addEntryPointToNgModule(options),
        () => {
            options.module = options.module.replace('.dev', '.build');
            console.warn('Options (BUILD): ', options);
        },
        ng_module_utils_1.addDeclarationToNgModule(options, false),
        ng_module_utils_1.addEntryPointToNgModule(options),
        () => {
            options.formRegistry = '/src/app/form.registry.ts';
            console.warn('Options (Form Registry): ', options);
        },
        updateFormRegistry(options)
    ]);
}
exports.formChain = formChain;
function updateFormRegistry(options) {
    return (host) => {
        console.log('updateFormRegistry: ', options);
        if (options.formRegistry && options.formRef && options.type && options.name) {
            var fRegBuffer = host.read(options.formRegistry);
            if (fRegBuffer) {
                var content = fRegBuffer.toString();
                // console.warn('Form Registry: ', content);
                console.log('--- Updating Form Registry ---');
                const recorder = host.beginUpdate(options.formRegistry);
                console.log('-        ID: ' + options.formRef);
                console.log('-      TYPE: ' + options.type);
                console.log('-      NAME: ' + options.name);
                const toInsert = "\n  new FormRecord('" + options.formRef + "', '" + options.type + "', '" + options.name + "', '" + options.name + " " + options.type + " Form', " + strings_1.classify(options.name) + "Component),";
                console.log('- INSERTING: ' + toInsert);
                const searchString = 'FORM_REGISTRY = [';
                recorder.insertRight(content.indexOf(searchString) + searchString.length, toInsert);
                // Add the import statement
                // import {F17CreatorFormComponent} from "./custom-forms/f17-creator-form/f17-creator-form.component";
                const importStatement = 'import {' + strings_1.classify(options.name) + 'Component} from \'./custom-forms/' + strings_1.dasherize(options.name) + '/' + strings_1.dasherize(options.name) + '.component\';\n';
                recorder.insertRight(0, importStatement);
                host.commitUpdate(recorder);
            }
        }
        return host;
    };
}
exports.updateFormRegistry = updateFormRegistry;
//# sourceMappingURL=form-utils.js.map
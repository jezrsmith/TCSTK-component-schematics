import { strings } from '@angular-devkit/core';
import {
  Rule,
  SchematicContext,
  Tree,
  apply,
  chain,
  mergeWith,
  template,
  url
} from '@angular-devkit/schematics';
import {addModuleImportToRootModule, getProjectFromWorkspace, getWorkspace} from "schematics-utilities";


// Instead of `any`, it would make sense here to get a schema-to-dts package and output the
// interfaces so you get type-safe options.
export default function (options: any): Rule {
  // The chain rule allows us to chain multiple rules and apply them one after the other.
  return chain([
    (_tree: Tree, context: SchematicContext) => {
      // Show the options for this Schematics.
      context.logger.info('-----------------------------------------------');
      context.logger.info('--- **  TIBCO CLOUD COMPONENT GENERATOR  ** ---');
      context.logger.info('--- **                V1.07              ** ---');
      context.logger.info('-----------------------------------------------');
      context.logger.info('--- ** TYPE: TIBCO CLOUD INTEGRATION     ** ---');
      context.logger.info('-----------------------------------------------');

      context.logger.info('Building TIBCO Cloud Component, with the following settings: ' + JSON.stringify(options));
    },

    // The schematic Rule calls the schematic from the same collection, with the options
    // passed in. Please note that if the schematic has a schema, the options will be
    // validated and could throw, e.g. if a required option is missing.
    //schematic('my-other-schematic', { option: true }),
    (host: Tree, context: SchematicContext) => {
      context.logger.log('info', "Name: " + options.name);
      context.logger.info('Adding dependencies...');

      const workspace = getWorkspace(host);
      const project = getProjectFromWorkspace(
          workspace,
          // Takes the first project in case it's not provided by CLI
          options.project ? options.project : Object.keys(workspace['projects'])[0]
      );
      const moduleName = options.name + 'Component';
      const sourceLoc = './' + options.name + '/' + options.name + '.component';
      context.logger.info('moduleName: ' + moduleName);
      context.logger.info('sourceLoc: ' + sourceLoc);
      context.logger.info('Project Root: ' + project.root);
      //console.log(project);

      addModuleImportToRootModule(host, moduleName, sourceLoc, project);
      context.logger.info('Installed Dependencies...');
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
    mergeWith(apply(url('./files'), [
      template({
        ...strings,
        INDEX: options.index,
        name: options.name,
      }),
    ])),
  ]);
}

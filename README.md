# Transloco auto scope

Automates the insertion of the [transloco read input](https://ngneat.github.io/transloco/docs/translation-in-the-template#utilizing-the-read-input) into html files. The command `Transloco Auto Scope` wraps the contents of the currently opened file in an `ng-container` tag as follows:

`<ng-container *transloco="let t; read: 'this.is.my.scope'"></ng-container>`

The property value is composed of the `root` property of the closest `project.json` and the file name.

#!/usr/bin/env node
/*
 *    nix-beautify formats/indents nix source code.
 *    Copyright (C) <info@nixcloud.io> nixcloud GmbH
 *
 *    This program is free software: you can redistribute it and/or modify
 *    it under the terms of the GNU Affero General Public License as
 *    published by the Free Software Foundation, either version 3 of the
 *    License, or (at your option) any later version.
 *
 *    This program is distributed in the hope that it will be useful,
 *    but WITHOUT ANY WARRANTY; without even the implied warranty of
 *    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *    GNU Affero General Public License for more details.
 *
 *    You should have received a copy of the GNU Affero General Public License
 *    along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

const fs = require('fs');
const stdinBuffer = fs.readFileSync(0); // STDIN_FILENO = 0

// print the formatted output
formatNixExpression(stdinBuffer.toString(), process.stdout);

function formatNixExpression(input, stream) {
  var indent = 0;
  var indentStr = "";
  var splitDoc = input.split("\n");

  for (const line of splitDoc){
    // failesafe that is needed because multiline comments as well as multiline
    // strings are currently not detected
    if (indent < 0) {
        indent = 0;
    }

    // cut comments
    var trimmedLine = line.trim();
    var commentStart = trimmedLine.indexOf('#');
    if (commentStart >= 0){
      trimmedLine = trimmedLine.substring(0, commentStart);
    }
    // cut nix-strings
    trimmedLine = trimmedLine.replace(/\".*\"/g, " ");
    var replacedLine = line;


    // matches ( [ { and 'let'
    var open = (trimmedLine.match(/[\[{\(]/g) || []).length;
    // match let
    open += (trimmedLine.match(/([\s=;\(]|^)let([\({\s]|$)/g) || []).length;
    // matches ) ] } and 'in'
    var close = ((" " +trimmedLine + " ").match(/[\]}\)]/g) || []).length;
    close += (trimmedLine.match(/([\s=;\(]|^)in([\({\s]|$)/g) || []).length;

    if (close > open && trimmedLine.length <= 3){
      indent = indent + open - close;
      indentStr = "  ".repeat(indent);
    }

    const currentIndent = line.search(/\S|$/) //current space count

    // check if the indentation needs to change
    if (indent*2 !== currentIndent){
      // replace current indentation with the new one
      replacedLine = indentStr + line.substring(currentIndent, line.length);
    }

    indent = indent + open - close;
    if (open > close){
      indentStr = "  ".repeat(indent);
    } else if (close > open && trimmedLine.length > 3){
      indentStr = "  ".repeat(indent+1);
    }

    stream.write(replacedLine + "\n")
  }
}

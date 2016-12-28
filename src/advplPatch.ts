import * as child_process from 'child_process';
import * as vscode from 'vscode';
import {inspect}  from 'util';
import {advplConsole}  from './advplConsole';
import * as fs from 'fs';
import * as path from 'path';
export class advplPatch {
    private outChannel : advplConsole;
    private EnvInfos :string;
    private debugPath : string;
    private consoleReturn
    constructor(jSonInfos : string, _outChannel : advplConsole )
    {
        this.outChannel = _outChannel;
        this.EnvInfos = jSonInfos;   
        this.debugPath = vscode.extensions.getExtension("KillerAll.advpl-vscode").extensionPath;
        if(process.platform == "darwin")
        {
            this.debugPath += "/bin/AdvplDebugBridgeMac";
        }
        else
        {
            this.debugPath += "\\bin\\AdvplDebugBridge.exe";
        }
             
        
    }
    public build(file : String)
    {
        var _args = new Array<string>();
        var that = this;        
                
        _args.push("--compileInfo=" + this.EnvInfos);
        _args.push("--patchBuild=" + file);

        var child = child_process.spawn(this.debugPath,_args);
        child.stdout.on("data",function(data){
      
            var xRet = data + "";
           if (xRet.indexOf("|") > 0) 
           {
                var values = String.fromCharCode.apply(null, data).split('|');
                that.consoleReturn = "Build Failure:" + values[3];
           }
           else
           {
               that.consoleReturn = xRet;
           }
        });
        

        child.on("exit",function(data){         
           that.outChannel.log(that.consoleReturn);
            
           
        });        
    }

     public apply(patchApply : string)
    {
        var _args = new Array<string>();
        var that = this;        
                
        _args.push("--compileInfo=" + this.EnvInfos);
        _args.push("--patchApply="+ patchApply);

        var child = child_process.spawn(this.debugPath,_args);
        child.stdout.on("data",function(data){      
           var xRet = data + "";
           if (xRet.indexOf("|") > 0) 
           {
                var values = String.fromCharCode.apply(null, data).split('|');
                that.consoleReturn = "Apply Failure:" + values[3];
           }
           else
           {
               that.consoleReturn = xRet;
           }
           
        });
        

        child.on("exit",function(data){
           that.outChannel.log(that.consoleReturn);
        });        
    }
     public info(patchApply : string)
    {
        var _args = new Array<string>();
        var that = this;        
                
        _args.push("--compileInfo=" + this.EnvInfos);
        _args.push("--patchInfo="+ patchApply);
        this.outChannel.log("Iniciando a analise do patch.");
        this.consoleReturn = "";
        var child = child_process.spawn(this.debugPath,_args);
        child.stdout.on("data",function(data){      
           var xRet = data + "";
         /*  if (xRet.indexOf("|") > 0) 
           {
                var values = String.fromCharCode.apply(null, data).split('|');
                that.consoleReturn = "Info Failure:" + values[3];
           }
           else*/
           {
               that.consoleReturn += xRet;
           }
           
        });
        

        child.on("exit",function(data){
           //that.outChannel.log(that.consoleReturn);
            that.outChannel.log("PatchInfo.log criado com sucesso!");
             const newFile = vscode.Uri.parse('untitled:' + path.join(vscode.workspace.rootPath, 'patchInfo.log'));
            vscode.workspace.openTextDocument(newFile).then(document => {
                const edit = new vscode.WorkspaceEdit();
                edit.insert(newFile, new vscode.Position(0, 0), that.consoleReturn);
                return vscode.workspace.applyEdit(edit).then(success => {
                    if (success) {                     
                        vscode.window.showTextDocument(document);
                    } else {
                        vscode.window.showInformationMessage('Error!');
                    }
                });
            });        
        });        
    }

}
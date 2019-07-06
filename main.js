const electron = require('electron');
const path = require('path');
const url = require('url');

// SET ENV
process.env.NODE_ENV = 'development';

const {app, BrowserWindow, Menu, ipcMain} = electron;

let mainWindow;
let addWindow;

// Ouvinte do aplicativo quando estiver pronto
app.on('ready', function(){
  // Criar nova janela
  mainWindow = new BrowserWindow({});
  // Carrega o html na janela
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'mainWindow.html'),
    protocol: 'file:',
    slashes:true
  }));
  // Fecha o aplicativo
  mainWindow.on('closed', function(){
    app.quit();
  });

  // Cria o menu
  const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
  // Insere o menu
  Menu.setApplicationMenu(mainMenu);
});

// Identifica item adicionados
function createAddWindow(){
  addWindow = new BrowserWindow({
    width: 300,
    height:200,
    title:'Add Shopping List Item'
  });
  addWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'addWindow.html'),
    protocol: 'file:',
    slashes:true
  }));
  // Lidando com lixo 
  addWindow.on('close', function(){
    addWindow = null;
  });
}

//  Pega items:add
ipcMain.on('item:add', function(e, item){
  mainWindow.webContents.send('item:add', item);
  addWindow.close(); 
  // Ainda tem uma referência para addWindow na memória. Precisa recuperar a memória (coleção Grabage)
  //addWindow = null;
});

// Cria o template para o menu
const mainMenuTemplate =  [
  // Cada objeto é um dropdown
  {
    label: 'Arquivos',
    submenu:[
      {
        label:'Add Item',
        click(){
          createAddWindow();
        }
      },
      {
        label:'Clear Items',
        click(){
          mainWindow.webContents.send('item:clear');
        }
      },
      {
        label: 'Quit',
        accelerator:process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q',
        click(){
          app.quit();
        }
      }
    ]
  }
];

// If OSX, adicionar objeto vazio ao menu
if(process.platform == 'darwin'){
  mainMenuTemplate.unshift({});
}

// Adicionar a opção de ferramentas de desenvolvedor se in dev
if(process.env.NODE_ENV !== 'production'){
  mainMenuTemplate.push({
    label: 'Developer Tools',
    submenu:[
      {
        role: 'reload'
      },
      {
        label: 'Toggle DevTools',
        accelerator:process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I',
        click(item, focusedWindow){
          focusedWindow.toggleDevTools();
        }
      }
    ]
  });
}
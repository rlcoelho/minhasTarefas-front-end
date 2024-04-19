/*
  --------------------------------------------------------------------------------------
  Função para posicionar a section corretamente ao clicar no menu
  --------------------------------------------------------------------------------------
*/

function scrollToSection(sectionId) {
    var section = document.getElementById(sectionId);
    if (section) {
        var position = section.offsetTop - 100; // 100px é o tamanho do header
        requestAnimationFrame(() => {
        window.scrollTo({ top: position, behavior: 'smooth' })
        });
    }
}


/*
  --------------------------------------------------------------------------------------
  Função para formatar campos data no formato DD/MM/AAAA HH:MM
  --------------------------------------------------------------------------------------
*/

function formatarData(dataString) {
    var data = new Date(dataString);
    var dia = ("0" + data.getUTCDate()).slice(-2);
    var mes = ("0" + (data.getUTCMonth() + 1)).slice(-2);
    var ano = data.getUTCFullYear();
    var horas = ("0" + data.getUTCHours()).slice(-2);
    var minutos = ("0" + data.getUTCMinutes()).slice(-2);

    return dia + "/" + mes + "/" + ano + " " + horas + ":" + minutos;
}


/*
  --------------------------------------------------------------------------------------
  Função para criar ícones do FontAwesome em cada tarefa com eventos onclick
  --------------------------------------------------------------------------------------
*/

const insertIcons = (parent, concluida) => {
    let checkIcon = document.createElement("i");
    checkIcon.className = (concluida ? "fas fa-check-square fa-lg" : "far fa-check-square fa-lg") + " icon";
    checkIcon.title = concluida ? "Reabrir" : "Concluir"; // texto alternativo
    checkIcon.onclick = function () {
        let div = this.parentElement.parentElement;
        const idTarefa = div.id;
        updateItem(idTarefa, !concluida); // passa o id e o novo status para updateItem
    };
    parent.appendChild(checkIcon);
    
    let trashIcon = document.createElement("i");
    trashIcon.className = "fa-regular fa-trash-can fa-lg icon";
    trashIcon.title = "Excluir"; // texto alternativo
        trashIcon.onclick = function () {
        let div = this.parentElement.parentElement;
        const idTarefa = div.id;
        if (confirm("Você tem certeza?")) {
            div.remove()
            deleteItem(idTarefa) // passa o id para a deleteItem
            alert("Removido!")
        }
    };
    parent.appendChild(trashIcon);
}


/*
  --------------------------------------------------------------------------------------
  Função para criar ícones do FontAwesome em cada categoria com eventos onclick
  --------------------------------------------------------------------------------------
*/

const insertIconsCategoria = (parent) => {
    let trashIcon = document.createElement("i");
    trashIcon.className = "fa-regular fa-trash-can fa-lg icon";
    trashIcon.title = "Excluir"; // texto alternativo
    trashIcon.onclick = function () {
        let div = this.parentElement.parentElement;
        const idCategoria = div.id;
        if (confirm("Você tem certeza?")) {
            verificaSeCategoriaTemTarefas(idCategoria, div);
        }
    };
    parent.appendChild(trashIcon);
}


/*
  --------------------------------------------------------------------------------------
  Função para inserir itens na lista de tarefas 
  --------------------------------------------------------------------------------------
*/

const insertList = (id, fk_categoria, descricao, data_prevista, descricao_categoria, concluida) => {
    var table = document.getElementById('myTable');
    var row = table.insertRow();
    row.id = id;
    row.insertCell(0).textContent = descricao_categoria;
    row.insertCell(1).textContent = descricao;
    row.insertCell(2).textContent = formatarData(data_prevista);
    insertIcons(row.insertCell(3), concluida);
    // Limpeza dos campos de entrada após inserção dos registros
    document.getElementById("fk_categoria").value = "";
    document.getElementById("descricao").value = "";
    document.getElementById("data_prevista").value = "";
}


/*
  --------------------------------------------------------------------------------------
  Função com a rota GET para obter a lista de tarefas
  --------------------------------------------------------------------------------------
*/

const getListaTarefas = async () => {
    let url = 'http://127.0.0.1:5000/tarefas';
    fetch(url, {
        method: 'get',
    })
    .then((response) => response.json())
    .then((data) => {
        // Limpa a tabela antes de inserir as novas linhas
        var table = document.getElementById('myTable');
        while (table.rows.length > 1) { // mantém a linha do cabeçalho
            table.deleteRow(1);
        }
        data.tarefas.forEach(item => {
            insertList(
                item.id,
                item.fk_categoria, 
                item.descricao, 
                item.data_prevista, 
                item.descricao_categoria,
                item.concluida
            )
        })
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}


/*
  --------------------------------------------------------------------------------------
  Função para incluir uma nova tarefa
  --------------------------------------------------------------------------------------
*/

const novaTarefa = () => {
    let inputCategoria = document.getElementById("fk_categoria").value;
    let inputDescricaoTarefa = document.getElementById("descricao").value;
    let inputDataPrevista = document.getElementById("data_prevista").value;
    
    // Verifica se todos os campos do formulário estão preenchidos
    if (inputCategoria.trim() !== "" && inputDescricaoTarefa.trim() !== "" && inputDataPrevista.trim() !== "") {
        try {
            postTarefa(inputCategoria, inputDescricaoTarefa, inputDataPrevista);
            alert("Tarefa incluída com sucesso!");
        } catch (error) {
            alert("Ocorreu um erro e a tarefa não foi registrada!");
        }
    } else {
        alert("Por favor, preencha todos os campos do formulário antes de enviar.");
    }
}


/*
  --------------------------------------------------------------------------------------
  Função com a rota POST que inclui uma tarefa
  --------------------------------------------------------------------------------------
*/

const postTarefa = async (inputCategoria, inputDescricaoTarefa, inputDataPrevista) => {
    const formData = new FormData();
    formData.append('fk_categoria', inputCategoria);
    formData.append('descricao', inputDescricaoTarefa);
    formData.append('data_prevista', inputDataPrevista);
  
    let url = 'http://127.0.0.1:5000/tarefa/';
    fetch(url, {
        method: 'post',
        body: formData
    })
    .then((response) => response.json())
    .catch((error) => {
        console.error('Error:', error);
    });
}


/*
  --------------------------------------------------------------------------------------
  Função com a rota PUT para atualizar status de uma tarefa
  --------------------------------------------------------------------------------------
*/

const updateItem = (idTarefa, status) => {
    let url = 'http://127.0.0.1:5000/tarefa?id=' + idTarefa + '&concluida=' + status;
    fetch(url, {
        method: 'put'
    })
        .then((response) => response.json())
        .then((data) => {
        // Após a atualização, busca a lista de tarefas novamente
        getListaTarefas();
    })
        .catch((error) => {
        console.error('Error:', error);
    });
}


/*
  --------------------------------------------------------------------------------------
  Função com a rota DELETE para excluir uma tarefa
  --------------------------------------------------------------------------------------
*/

const deleteItem = (idTarefa) => {
    let url = 'http://127.0.0.1:5000/tarefa?id=' + idTarefa;
    fetch(url, {
        method: 'delete'
    })
        .then((response) => response.json())
        .catch((error) => {
        console.error('Error:', error);
    });
}


/*
  --------------------------------------------------------------------------------------
  Função com a rota GET para verificar se uma categoria pode ser excluída
  --------------------------------------------------------------------------------------
*/

const verificaSeCategoriaTemTarefas = (idCategoria, div) => {
    let url = 'http://127.0.0.1:5000/categoria/tem_tarefas?id_categoria=' + idCategoria;
    fetch(url)
        .then((response) => response.json())
        .then((data) => {

        let tem_tarefas = false;
        if (data.tem_tarefas.tem_tarefas === true) {
            tem_tarefas = true;
        } else if (data.tem_tarefas.tem_tarefas === false) {
            tem_tarefas = false;
        } else {
            console.error('Resposta inesperada do servidor:', data.tem_tarefas.tem_tarefas);
        }
      
        if (tem_tarefas) {
            alert('Esta categoria não pode ser excluída porque tem tarefas associadas a ela.');
        } else {
            deleteItemCategoria(idCategoria, div);
        }
    })
        .catch((error) => {
        console.error('Error:', error);
    });
}


/*
  --------------------------------------------------------------------------------------
  Função com a rota DELETE para excluir uma categoria
  --------------------------------------------------------------------------------------
*/

const deleteItemCategoria = (idCategoria, div) => {
    let url = 'http://127.0.0.1:5000/categoria?id_categoria=' + idCategoria;
    fetch(url, {
        method: 'delete'
    })
        .then((response) => response.json())
        .then((data) => {
        // Recarrega o select com as categorias após a exclusão
        getSelectCategorias();
        // Remove a linha na interface do usuário
        div.remove();
        alert("Categoria removida!")
    })
        .catch((error) => {
        console.error('Error:', error);
    });
}


/*
  --------------------------------------------------------------------------------------
  Função para incluir uma nova categoria
  --------------------------------------------------------------------------------------
*/

const novaCategoria = () => {
    let inputDescricaoCategoria = document.getElementById("descricao_categoria").value;
    
    // Verifica se o campo do formulário foi preenchido
    if (inputDescricaoCategoria.trim() !== "") {
            postCategoria(inputDescricaoCategoria);
            alert("Categoria incluída com sucesso!");
    } else {
        alert("Por favor, preencha o campo do formulário antes de enviar.");
    }
}


/*
  --------------------------------------------------------------------------------------
  Função com a rota POST que inclui uma categoria
  --------------------------------------------------------------------------------------
*/

const postCategoria = async (inputDescricaoCategoria) => {
    const formData = new FormData();
    formData.append('descricao_categoria', inputDescricaoCategoria);
    let url = 'http://127.0.0.1:5000/categoria/';
    fetch(url, {
        method: 'post',
        body: formData
    })
        .then((response) => response.json())
        .catch((error) => {
        console.error('Error:', error);
    });
}


/*
  --------------------------------------------------------------------------------------
  Função para carregar as categorias dentro do select no form de inclusão de tarefa
  --------------------------------------------------------------------------------------
*/

const getSelectCategorias = async () => {
    let url = 'http://127.0.0.1:5000/categorias';
    fetch(url, {
        method: 'get',
    })
    .then(response => response.json())
    .then(data => {
        const select = document.getElementById('fk_categoria');
        // Limpa as opções existentes
        select.innerHTML = '';
        // Adiciona a opção padrão
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.text = 'Selecione:';
        select.add(defaultOption);
        // Adiciona as categorias
        data.categorias.forEach(categoria => {
            const option = document.createElement('option');
            option.value = categoria.id_categoria;
            option.text = categoria.descricao_categoria;
            select.add(option);
        });
    });
}


/*
--------------------------------------------------------------------------------------
  Função com a rota GET para obter a lista de categorias
--------------------------------------------------------------------------------------
*/

const getListaCategorias = async () => {
    let url = 'http://127.0.0.1:5000/categorias';
    fetch(url, {
        method: 'get',
    })
    .then((response) => response.json())
    .then((data) => {
        // Limpa a tabela antes de inserir as novas linhas
        var table = document.getElementById('myTable2');
        while (table.rows.length > 1) { // mantém a linha do cabeçalho
            table.deleteRow(1);
        }
        data.categorias.forEach(item => {
            insertListCategorias(
                item.id_categoria,
                item.descricao_categoria
            )
        })
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}


/*
  --------------------------------------------------------------------------------------
  Função para inserir itens na lista de categorias 
  --------------------------------------------------------------------------------------
*/

const insertListCategorias = (id_categoria, descricao_categoria) => {
    var table = document.getElementById('myTable2');
    var row = table.insertRow();
    row.id = id_categoria;
    row.insertCell(0).textContent = descricao_categoria;
    insertIconsCategoria(row.insertCell(1));
    // Limpeza dos campos de entrada após inserção dos registros
    document.getElementById("descricao_categoria").value = "";
}


/*
  --------------------------------------------------------------------------------------
  Inicializa as listas somente após a página estar totalmente carregada
  --------------------------------------------------------------------------------------
*/

document.addEventListener('DOMContentLoaded', (event) => {
    getListaTarefas(); 
    getSelectCategorias();
    getListaCategorias();
});
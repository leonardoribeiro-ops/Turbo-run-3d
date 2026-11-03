
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

// CARREGADOR DOS MODELOS 3D
const loader = new GLTFLoader();

// CENA
const scene = new THREE.Scene();

scene.background = new THREE.Color(0x101827);
scene.fog = new THREE.Fog(0x101827, 35, 150);

// CÂMERA
const camera = new THREE.PerspectiveCamera(
    65,
    window.innerWidth / window.innerHeight,
    0.1,
    300
);

camera.position.set(0, 8, 14);
camera.lookAt(0, 0, -10);

// RENDERIZADOR
const renderer = new THREE.WebGLRenderer({
    antialias: true
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;

document.body.appendChild(renderer.domElement);

// LUZES
const luzAmbiente = new THREE.HemisphereLight(
    0xffffff,
    0x334455,
    2
);

scene.add(luzAmbiente);

const luzPrincipal = new THREE.DirectionalLight(0xffffff, 2);

luzPrincipal.position.set(-5, 15, 8);
luzPrincipal.castShadow = true;

scene.add(luzPrincipal);

// CHÃO
const chao = new THREE.Mesh(
    new THREE.PlaneGeometry(300, 400),
    new THREE.MeshStandardMaterial({
        color: 0x263b35
    })
);

chao.rotation.x = -Math.PI / 2;
chao.position.set(0, -0.15, -120);
chao.receiveShadow = true;

scene.add(chao);

// PISTA
const pista = new THREE.Mesh(
    new THREE.PlaneGeometry(12, 330),
    new THREE.MeshStandardMaterial({
        color: 0x252a32,
        roughness: 0.9
    })
);

pista.rotation.x = -Math.PI / 2;
pista.position.set(0, 0, -120);
pista.receiveShadow = true;

scene.add(pista);

// LATERAIS DA PISTA
function criarBarreira(x) {
    const barreira = new THREE.Mesh(
        new THREE.BoxGeometry(0.4, 0.5, 330),
        new THREE.MeshStandardMaterial({
            color: 0x00bde8
        })
    );

    barreira.position.set(x, 0.25, -120);

    scene.add(barreira);
}

criarBarreira(-6.2);
criarBarreira(6.2);

// FAIXAS DA PISTA
const faixas = [];

for (let i = 0; i < 35; i++) {
    const faixa = new THREE.Mesh(
        new THREE.BoxGeometry(0.12, 0.03, 3),
        new THREE.MeshStandardMaterial({
            color: 0xffffff
        })
    );

    faixa.position.set(0, 0.02, 15 - i * 9);

    scene.add(faixa);
    faixas.push(faixa);
}

// GRUPO DO CARRO
const car = new THREE.Group();

car.position.set(0, 0, 5);

scene.add(car);

// CAMINHOS DOS MODELOS
const modelosCarros = {
    blue: "car-Blue.glb",
    red: "car-Red.glb",
    black: "car-Green.glb",
    green: "car-White.glb"
};

// VARIÁVEIS DO CARREGAMENTO
let carroSelecionado = "blue";
let numeroCarregamento = 0;
let carroCarregado = false;

const loadingText = document.getElementById("loadingText");
const startButton = document.getElementById("startButton");

// CARREGAR MODELO 3D
function carregarCarro(tipo) {
    carroSelecionado = tipo;

    const carregamentoAtual = ++numeroCarregamento;

    carroCarregado = false;
    startButton.disabled = true;

    loadingText.textContent = "Carregando carro 3D...";

    // REMOVE O CARRO ANTERIOR
    while (car.children.length > 0) {
        car.remove(car.children[0]);
    }

    loader.load(
        "./" + modelosCarros[tipo],

        function (gltf) {
            if (carregamentoAtual !== numeroCarregamento) {
                return;
            }

            const modelo = gltf.scene;

            // CALCULA AS DIMENSÕES ORIGINAIS
            const caixaOriginal = new THREE.Box3().setFromObject(modelo);

            const tamanhoOriginal = new THREE.Vector3();

            caixaOriginal.getSize(tamanhoOriginal);

            // CORRIGE A ORIENTAÇÃO DO MODELO
            if (tamanhoOriginal.x > tamanhoOriginal.z) {
                modelo.rotation.y = -Math.PI / 2;
            } else {
                modelo.rotation.y = 0;
            }

            // CONFIGURA AS SOMBRAS
            modelo.traverse(function (objeto) {
                if (objeto.isMesh) {
                    objeto.castShadow = true;
                    objeto.receiveShadow = true;
                }
            });

            // CRIA UM GRUPO PARA CENTRALIZAR O CARRO
            const grupoModelo = new THREE.Group();

            grupoModelo.add(modelo);

            // CALCULA AS DIMENSÕES DEPOIS DA ROTAÇÃO
            const caixa = new THREE.Box3().setFromObject(modelo);

            const tamanho = new THREE.Vector3();
            const centro = new THREE.Vector3();

            caixa.getSize(tamanho);
            caixa.getCenter(centro);

            // AJUSTA O TAMANHO
            const maiorTamanho = Math.max(
                tamanho.x,
                tamanho.y,
                tamanho.z
            );

            if (maiorTamanho > 0) {
                const escala = 2.8 / maiorTamanho;

                grupoModelo.scale.setScalar(escala);

                // CENTRALIZA E COLOCA O CARRO NO CHÃO
                grupoModelo.position.set(
                    -centro.x * escala,
                    -caixa.min.y * escala,
                    -centro.z * escala
                );
            }

            car.add(grupoModelo);

            carroCarregado = true;
            startButton.disabled = false;

            loadingText.textContent = "Carro carregado!";

            console.log("Carro carregado:", modelosCarros[tipo]);
            console.log("Dimensões originais:", tamanhoOriginal);
        },

        function (progresso) {
            if (progresso.total > 0) {
                const porcentagem = Math.round(
                    progresso.loaded / progresso.total * 100
                );

                loadingText.textContent =
                    "Carregando carro: " + porcentagem + "%";
            }
        },

        function (erro) {
            if (carregamentoAtual !== numeroCarregamento) {
                return;
            }

            console.error(
                "Erro ao carregar o carro:",
                modelosCarros[tipo],
                erro
            );

            loadingText.textContent =
                "Não foi possível carregar esse carro. Confira o arquivo.";

            startButton.disabled = true;
        }
    );
}

// SELEÇÃO DOS CARROS
const botoesCarros = document.querySelectorAll(".car-option");

botoesCarros.forEach(function (botao) {
    botao.addEventListener("click", function () {
        const tipo = botao.dataset.car;

        botoesCarros.forEach(function (item) {
            item.classList.remove("selected");
        });

        botao.classList.add("selected");

        carregarCarro(tipo);
    });
});

// CARREGA O PRIMEIRO CARRO
carregarCarro("blue");

// OBSTÁCULOS
const obstaculos = [];

function criarObstaculo(x, z) {
    const obstaculo = new THREE.Mesh(
        new THREE.BoxGeometry(1.5, 1.4, 1.5),
        new THREE.MeshStandardMaterial({
            color: 0xff5722
        })
    );

    obstaculo.position.set(x, 0.7, z);
    obstaculo.castShadow = true;

    obstaculo.userData.atingido = false;

    scene.add(obstaculo);

    obstaculos.push(obstaculo);
}

for (let i = 0; i < 18; i++) {
    const posicaoX = [-3.5, 0, 3.5][
        Math.floor(Math.random() * 3)
    ];

    criarObstaculo(posicaoX, -15 - i * 13);
}

// MOEDAS
const moedas = [];

function criarMoeda(x, z) {
    const moeda = new THREE.Mesh(
        new THREE.TorusGeometry(0.5, 0.13, 12, 24),
        new THREE.MeshStandardMaterial({
            color: 0xffd700,
            metalness: 0.7,
            roughness: 0.25
        })
    );

    moeda.position.set(x, 1.2, z);
    moeda.rotation.x = Math.PI / 2;

    scene.add(moeda);

    moedas.push(moeda);
}

for (let i = 0; i < 25; i++) {
    const posicaoX = [-3.5, 0, 3.5][
        Math.floor(Math.random() * 3)
    ];

    criarMoeda(posicaoX, -12 - i * 9);
}

// LINHA DE CHEGADA
const linhaChegada = new THREE.Group();

linhaChegada.position.set(0, 0.04, -250);

scene.add(linhaChegada);

const tamanhoQuadrado = 0.8;

for (let linha = 0; linha < 2; linha++) {
    for (let coluna = 0; coluna < 15; coluna++) {
        const cor = (linha + coluna) % 2 === 0
            ? 0xffffff
            : 0x111111;

        const quadrado = new THREE.Mesh(
            new THREE.BoxGeometry(
                tamanhoQuadrado,
                0.05,
                tamanhoQuadrado
            ),
            new THREE.MeshStandardMaterial({
                color: cor
            })
        );

        quadrado.position.set(
            -5.6 + coluna * tamanhoQuadrado,
            0,
            -0.4 + linha * tamanhoQuadrado
        );

        linhaChegada.add(quadrado);
    }
}

// ELEMENTOS DA INTERFACE
const scoreElement = document.getElementById("score");
const coinsElement = document.getElementById("coins");
const distanceElement = document.getElementById("distance");

const healthFill = document.getElementById("healthFill");
const healthText = document.getElementById("healthText");

const message = document.getElementById("message");
const finishMessage = document.getElementById("finishMessage");

const restartButton = document.getElementById("restartButton");

const finalScore = document.getElementById("finalScore");
const finishTitle = document.getElementById("finishTitle");

// VARIÁVEIS DO JOGO
let running = false;
let score = 0;
let coinCount = 0;
let distance = 0;
let health = 100;

let speed = 0.55;

const velocidadeNormal = 0.55;
const distanciaFinal = 250;

const teclas = {
    ArrowLeft: false,
    ArrowRight: false,
    ArrowUp: false,
    ArrowDown: false
};

// ATUALIZA A INTERFACE
function atualizarInterface() {
    scoreElement.textContent = score;
    coinsElement.textContent = coinCount;
    distanceElement.textContent = Math.floor(distance);

    healthFill.style.width = health + "%";
    healthText.textContent = health + "%";

    if (health <= 30) {
        healthFill.style.background = "#ff3030";
        healthText.style.color = "#ff3030";
    } else if (health <= 60) {
        healthFill.style.background = "#ffb52e";
        healthText.style.color = "#ffb52e";
    } else {
        healthFill.style.background = "#20e66b";
        healthText.style.color = "#20e66b";
    }
}

// INICIAR JOGO
function iniciarJogo() {
    if (!carroCarregado) {
        return;
    }

    score = 0;
    coinCount = 0;
    distance = 0;
    health = 100;
    speed = velocidadeNormal;

    car.position.x = 0;
    linhaChegada.position.z = -distanciaFinal;

    // REPOSICIONA OS OBSTÁCULOS
    obstaculos.forEach(function (obstaculo, i) {
        obstaculo.position.z = -15 - i * 13;
        obstaculo.userData.atingido = false;
    });

    // REPOSICIONA AS MOEDAS
    moedas.forEach(function (moeda, i) {
        moeda.position.z = -12 - i * 9;
        moeda.visible = true;
    });

    atualizarInterface();

    running = true;

    message.classList.add("hidden");
    finishMessage.classList.add("hidden");
}

// VOLTAR AO MENU DE SELEÇÃO
function voltarAoMenu() {
    running = false;

    finishMessage.classList.add("hidden");
    message.classList.remove("hidden");

    startButton.disabled = !carroCarregado;

    loadingText.textContent = carroCarregado
        ? "Escolha seu carro e prepare-se!"
        : "Carregando carro 3D...";
}

// FINALIZAR JOGO
function finalizarJogo(titulo) {
    running = false;

    finishTitle.textContent = titulo;

    finalScore.textContent =
        "Pontuação: " + score +
        " | Moedas: " + coinCount +
        " | Distância: " + Math.floor(distance) + " m";

    finishMessage.classList.remove("hidden");
}

// COLISÃO COM OBSTÁCULOS
function verificarObstaculos() {
    obstaculos.forEach(function (obstaculo) {
        const distanciaX = Math.abs(
            car.position.x - obstaculo.position.x
        );

        const distanciaZ = Math.abs(
            car.position.z - obstaculo.position.z
        );

        if (
            distanciaX < 1.3 &&
            distanciaZ < 1.8 &&
            !obstaculo.userData.atingido
        ) {
            obstaculo.userData.atingido = true;

            health -= 25;

            if (health < 0) {
                health = 0;
            }

            speed = Math.max(0.25, speed - 0.12);

            atualizarInterface();

            if (health <= 0) {
                finalizarJogo("CARRO DANIFICADO!");
            }
        }
    });
}

// COLETAR MOEDAS
function verificarMoedas() {
    moedas.forEach(function (moeda) {
        if (!moeda.visible) {
            return;
        }

        const distanciaX = Math.abs(
            car.position.x - moeda.position.x
        );

        const distanciaZ = Math.abs(
            car.position.z - moeda.position.z
        );

        if (distanciaX < 1.3 && distanciaZ < 1.8) {
            moeda.visible = false;

            coinCount++;

            atualizarInterface();
        }
    });
}

// TECLADO
window.addEventListener("keydown", function (evento) {
    if (teclas.hasOwnProperty(evento.key)) {
        evento.preventDefault();
        teclas[evento.key] = true;
    }
});

window.addEventListener("keyup", function (evento) {
    if (teclas.hasOwnProperty(evento.key)) {
        teclas[evento.key] = false;
    }
});

window.addEventListener("blur", function () {
    Object.keys(teclas).forEach(function (tecla) {
        teclas[tecla] = false;
    });
});

// BOTÕES
startButton.addEventListener("click", iniciarJogo);
restartButton.addEventListener("click", voltarAoMenu);

// ANIMAÇÃO
function animar() {
    requestAnimationFrame(animar);

    if (running) {
        // ACELERAR E FREAR
        if (teclas.ArrowUp) {
            speed = Math.min(speed + 0.012, 1.15);
        } else if (teclas.ArrowDown) {
            speed = Math.max(speed - 0.02, 0.2);
        } else {
            speed += (velocidadeNormal - speed) * 0.02;
        }

        // MOVIMENTO DO CARRO
        if (teclas.ArrowLeft) {
            car.position.x -= 0.13;
        }

        if (teclas.ArrowRight) {
            car.position.x += 0.13;
        }

        // LIMITES DA PISTA
        car.position.x = THREE.MathUtils.clamp(
            car.position.x,
            -4.7,
            4.7
        );

        // MOVIMENTO DA PISTA
        const movimento = speed;

        distance += movimento;

        // ATUALIZA AS FAIXAS
        faixas.forEach(function (faixa) {
            faixa.position.z += movimento;

            if (faixa.position.z > 15) {
                faixa.position.z -= 315;
            }
        });

        // MOVIMENTO DOS OBSTÁCULOS
        obstaculos.forEach(function (obstaculo) {
            obstaculo.position.z += movimento;

            if (obstaculo.position.z > 12) {
                obstaculo.position.z -= 230;

                obstaculo.userData.atingido = false;

                obstaculo.position.x = [-3.5, 0, 3.5][
                    Math.floor(Math.random() * 3)
                ];
            }
        });

        // MOVIMENTO DAS MOEDAS
        moedas.forEach(function (moeda) {
            moeda.position.z += movimento;

            moeda.rotation.z += 0.04;

            if (moeda.position.z > 12) {
                moeda.position.z -= 225;

                moeda.visible = true;

                moeda.position.x = [-3.5, 0, 3.5][
                    Math.floor(Math.random() * 3)
                ];
            }
        });

        // MOVIMENTO DA LINHA DE CHEGADA
        linhaChegada.position.z += movimento;

        // VERIFICA COLISÕES
        verificarObstaculos();
        verificarMoedas();

        // PONTUAÇÃO
        score = Math.floor(distance) + coinCount * 10;

        atualizarInterface();

        // CHEGADA
        if (distance >= distanciaFinal) {
            finalizarJogo("VOCÊ CHEGOU!");
        }
    }

    // CÂMERA ACOMPANHA O CARRO
    camera.position.x += (
        car.position.x * 0.25 - camera.position.x
    ) * 0.05;

    camera.lookAt(car.position.x * 0.15, 0, -10);

    renderer.render(scene, camera);
}

animar();

// AJUSTAR A TELA
window.addEventListener("resize", function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );

    renderer.setPixelRatio(
        Math.min(window.devicePixelRatio, 2)
    );
});

const { createApp, ref, computed } = Vue;

// URL final do seu servidor de back-end.
const API_BASE_URL = 'https://noskill-servidor.onrender.com';

const App = {
    setup() {
        // --- ESTADO GERAL DO APP ---
        const currentScreen = ref('login');
        const user = ref({ username: '', password: '' });
        const loginError = ref('');
        const isLoggingIn = ref(false);
        const mainButtonState = ref('OFF'); 
        const mainButtonSubText = ref('Sistema Desativado');

        // --- ESTADO DO PAINEL ---
        const activeTab = ref('aim');
        const toast = ref({ visible: false, message: '' });
        
        // --- ESTADO DOS CARDS DE STATUS ---
        const statusCards = ref({
            protection: 'INATIVO',
            ping: '-- ms',
            performance: 'OCIOSO'
        });

        // --- ESTADO DOS POP-UPS (MODALS) ---
        const isModalVisible = ref(false);
        const modalContent = ref({ title: '', description: '' });
        const isGuideVisible = ref(false);
        const isMenuVisible = ref(false);
        const isInstallGuideVisible = ref(false);
        const installInstructions = ref({});

        // --- DEFINIÇÕES DAS FUNÇÕES (Para os pop-ups) ---
        const functionDetails = {
            miraGruda: { title: 'Módulo: Aimbot de Correção V2', description: 'Este módulo analisa a zona morta do seu touchscreen e ajusta a taxa de resposta do toque. Ao ser ativado, aplica micro-correções na trajetória da mira, aumentando a aderência ao alvo em movimento e diminuindo a dispersão de balas em até 35%.' },
            miraLock: { title: 'Módulo: Trava de Mira Magnética', description: 'Ativa um campo de assistência magnética sutil ao redor do alvo quando a mira está próxima, garantindo que disparos rápidos permaneçam focados no inimigo. Ideal para combates de curta distância.' },
            antiPinada: { title: 'Módulo: Estabilizador de Disparo', description: 'Reduz a trepidação vertical da mira durante disparos contínuos (pinadas). O sistema compensa o recuo da arma, mantendo a mira mais estável e precisa.' },
            aimFov: { title: 'Módulo: Campo de Visão Assistido (FOV)', description: 'Expande a área de detecção do aim assist em 90 graus na horizontal, facilitando a aquisição de alvos que entram rapidamente no seu campo de visão.' },
            puxadaAuto: { title: 'Módulo: Assistência de Puxada Rápida', description: 'Aplica uma força inicial na mira em direção à cabeça do oponente assim que o botão de atirar é pressionado, otimizando a chance de "capa" no primeiro disparo.' },
            soCapa: { title: 'Módulo: Prioridade de Headshot', description: 'Configura o aim assist para priorizar a cabeça como ponto focal, ignorando o peito do oponente. Aumenta significativamente a porcentagem de headshots em trocas diretas.' },
            otimizarPing: { title: 'Função: Otimizador de Rota de Rede', description: 'Redireciona sua conexão através de rotas de baixa latência, diminuindo o tempo de resposta (ping) com o servidor do jogo e reduzindo o "delay" em suas ações.'},
            limparCache: { title: 'Função: Limpeza de Cache Profunda', description: 'Realiza uma limpeza de arquivos temporários e desnecessários do jogo e do sistema, liberando memória RAM e melhorando os tempos de carregamento.'},
            fpsNoTalo: { title: 'Função: Desbloqueio de FPS', description: 'Remove as limitações de taxa de quadros impostas pelo sistema, permitindo que o jogo rode na máxima performance que seu dispositivo pode oferecer, resultando em uma jogabilidade mais fluida.'},
            modoPerformance: { title: 'Função: Modo de Alta Performance', description: 'Força o processador e a placa de vídeo do seu dispositivo a operarem em capacidade máxima, priorizando o desempenho do jogo sobre outras tarefas em segundo plano.'},
            antiAquecimento: { title: 'Função: Controle Térmico', description: 'Gerencia a temperatura do seu dispositivo de forma inteligente, prevenindo o superaquecimento que causa quedas de FPS e "travamentos" durante longas sessões de jogo.'},
            economiaBateria: { title: 'Função: Gerenciador de Bateria Gamer', description: 'Otimiza o consumo de energia sem sacrificar a performance, permitindo que você jogue por mais tempo antes de precisar recarregar o dispositivo.'},
            semRecuo: { title: 'Função Especial: Controle de Recuo Zero', description: 'Aplica um script avançado de controle de padrão de disparo que anula quase completamente o recuo vertical e horizontal de todas as armas automáticas.'},
            toqueSuave: { title: 'Função Especial: Resposta de Toque Otimizada', description: 'Aumenta a sensibilidade e a velocidade de registro do toque na tela, tornando movimentos como "subir capa" e "gelo agachado" mais rápidos e responsivos.'},
            boostIA: { title: 'Função Especial: Boost de Inteligência Artificial', description: 'Ativa uma camada secundária de assistência de mira baseada em IA que prevê os movimentos do oponente, oferecendo uma vantagem competitiva em situações de alta complexidade.'}
        };

        // --- ESTADO DAS FUNÇÕES (PLACEBO) ---
        const aimToggles = ref({ miraGruda: false, miraLock: false, antiPinada: false, aimFov: false, puxadaAuto: false, soCapa: false });
        const sensitivitySliders = ref({ geral: 95, redDot: 90, mira2x: 100, mira4x: 100, velocidadeToque: 85 });
        const optimizationToggles = ref({ otimizarPing: false, limparCache: false, fpsNoTalo: false, modoPerformance: false, antiAquecimento: false, economiaBateria: false });
        const specialToggles = ref({ semRecuo: false, toqueSuave: false, boostIA: false });
        const iaState = ref({ phoneModel: 'Autodetectado', gameStyle: 'Agressivo (Rusher)', isAnalyzing: false, analysisText: '' });

        // --- FUNÇÕES ---
        
        async function handleLogin() {
            if (isLoggingIn.value) return;
            loginError.value = '';
            isLoggingIn.value = true;
            if (!user.value.username || !user.value.password) {
                loginError.value = 'Por favor, preencha todos os campos.';
                isLoggingIn.value = false;
                return;
            }
            try {
                const response = await fetch(`${API_BASE_URL}/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        username: user.value.username,
                        password: user.value.password,
                    }),
                });
                const data = await response.json();
                if (data.status === 'success') {
                    currentScreen.value = 'dashboard';
                    if (!localStorage.getItem('noskillGuideShown')) {
                        isGuideVisible.value = true;
                        localStorage.setItem('noskillGuideShown', 'true');
                    }
                } else {
                    loginError.value = data.message || 'Credenciais inválidas.';
                }
            } catch (error) {
                console.error('Erro de conexão:', error);
                loginError.value = 'Não foi possível conectar ao servidor.';
            } finally {
                isLoggingIn.value = false;
            }
        }

        function activateSystem() {
            if (mainButtonState.value !== 'OFF') return;
            mainButtonState.value = 'VERIFICANDO';
            mainButtonSubText.value = 'Analisando sistema...';
            statusCards.value.protection = 'VERIFICANDO...';
            setTimeout(() => {
                mainButtonState.value = 'INJETANDO';
                mainButtonSubText.value = 'Aplicando otimizações...';
                statusCards.value.ping = 'Otimizando...';
                setTimeout(() => {
                    const randomPing = Math.floor(Math.random() * 20) + 15;
                    statusCards.value.ping = `${randomPing}ms`;
                }, 1000);
            }, 2000);
            setTimeout(() => {
                mainButtonState.value = 'ON';
                mainButtonSubText.value = 'Sistema Ativo e Protegido';
                statusCards.value.protection = 'SEGURO';
                statusCards.value.performance = 'ESTÁVEL';
                showToast('Sistema Noskill Ativado e Protegido.');
            }, 4000);
        }

        function showInstallGuide() {
            isMenuVisible.value = false; 
            const userAgent = navigator.userAgent || navigator.vendor || window.opera;
            if (/android/i.test(userAgent)) {
                installInstructions.value = {
                    title: "Instalar no Android",
                    steps: [
                        "Toque nos três pontinhos (⋮) no canto superior direito do navegador Chrome.",
                        "No menu, selecione a opção 'Instalar aplicativo' ou 'Adicionar à tela inicial'.",
                        "Confirme a instalação. O painel aparecerá como um app na sua tela de início!"
                    ]
                };
            } else if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
                 installInstructions.value = {
                    title: "Instalar no iPhone/iPad",
                    steps: [
                        "Toque no ícone de compartilhamento (um quadrado com uma seta para cima) na barra inferior do Safari.",
                        "Role para baixo e selecione a opção 'Adicionar à Tela de Início'.",
                        "Confirme o nome e toque em 'Adicionar'. O painel aparecerá como um app na sua tela de início!"
                    ]
                };
            } else {
                 installInstructions.value = {
                    title: "Modo App",
                    steps: ["Esta função é otimizada para navegadores de celular (Chrome no Android e Safari no iOS). Use o ícone 'Instalar' na barra de endereço do seu navegador de desktop, se disponível."]
                };
            }
            isInstallGuideVisible.value = true;
        }

        function openPanel() { currentScreen.value = 'panel'; }
        
        function closePanel() { 
            const panelToggle = document.querySelector('input[type="checkbox"][data-panel-toggle]');
            if (panelToggle) panelToggle.checked = false;
            currentScreen.value = 'dashboard'; 
        }

        function changeTab(tabName) { activeTab.value = tabName; }
        
        function showToast(message) {
            toast.value.message = message;
            toast.value.visible = true;
            setTimeout(() => { toast.value.visible = false; }, 2500);
        }
        
        function handleSimpleToggle(featureName, isEnabled) { showToast(`${featureName} ${isEnabled ? 'Ativado' : 'Desativado'}`); }

        function handleOptimizationToggle(featureName, toggleState) {
            handleSimpleToggle(featureName, toggleState);
            if (featureName === 'Limpar Cache' && toggleState) {
                const randomCache = (Math.random() * 300 + 150).toFixed(2);
                showToast(`${randomCache}MB de cache limpo!`);
                setTimeout(() => { optimizationToggles.value.limparCache = false; }, 1500);
            }
        }
        
        function handleSensitivityChange(featureName, value) { showToast(`${featureName} calibrado para ${value}`); }

        function runIAAnalysis() {
            if (!iaState.value.phoneModel || !iaState.value.gameStyle) { showToast('Preencha todos os campos da IA'); return; }
            iaState.value.isAnalyzing = true;
            iaState.value.analysisText = 'Analisando hardware do dispositivo...';
            setTimeout(() => { iaState.value.analysisText = 'Cruzando dados com pro-players...'; }, 2000);
            setTimeout(() => { iaState.value.analysisText = 'Calibrando DPI virtual e resposta de toque...'; }, 4000);
            setTimeout(() => {
                iaState.value.isAnalyzing = false;
                showToast('IA Noskill Concluída! Configuração aplicada.');
            }, 6000);
        }
        
        function openModal(featureKey) {
            const details = functionDetails[featureKey];
            if (details) {
                modalContent.value = details;
                isModalVisible.value = true;
            }
        }
        
        function logout() {
            isMenuVisible.value = false;
            mainButtonState.value = 'OFF';
            mainButtonSubText.value = 'Sistema Desativado';
            statusCards.value = { protection: 'INATIVO', ping: '-- ms', performance: 'OCIOSO' };
            user.value.username = '';
            user.value.password = '';
            loginError.value = '';
            currentScreen.value = 'login';
        }
        
        const isMainToggleOn = computed(() => mainButtonState.value === 'ON');

        return { 
            currentScreen, user, loginError, isLoggingIn, mainButtonState, mainButtonSubText, 
            activeTab, toast, statusCards, isModalVisible, modalContent, isGuideVisible, 
            isMenuVisible, aimToggles, sensitivitySliders, optimizationToggles, 
            specialToggles, iaState, handleLogin, activateSystem, openPanel, closePanel, 
            changeTab, showToast, handleSimpleToggle, handleOptimizationToggle, 
            handleSensitivityChange, runIAAnalysis, openModal, logout, isMainToggleOn,
            isInstallGuideVisible, installInstructions, showInstallGuide
        };
    },
    template: `
    <div v-if="isInstallGuideVisible" @click="isInstallGuideVisible = false" class="modal-overlay fade-in">
        <div @click.stop class="bg-[#1E1E1E] border border-gray-700 rounded-2xl p-6 w-11/12 max-w-sm text-white">
            <h3 class="font-teko text-3xl mb-2">{{ installInstructions.title }}</h3>
            <div class="text-sm text-gray-300 space-y-3 mb-4">
                <p v-for="(step, index) in installInstructions.steps" :key="index">
                    <strong>Passo {{ index + 1 }}:</strong><br>{{ step }}
                </p>
            </div>
            <button @click="isInstallGuideVisible = false" class="w-full bg-[#E53935] font-teko text-lg py-2 rounded-lg">ENTENDI!</button>
        </div>
    </div>
    <div v-if="iaState.isAnalyzing" class="ia-overlay fade-in">
        <div class="ia-loader text-white text-center"><i class="fa-solid fa-brain text-6xl text-[#E53935] mb-4"></i><h2 class="font-teko text-4xl mb-2">Analisando...</h2><span :key="iaState.analysisText" class="text-gray-300">{{ iaState.analysisText }}</span></div>
    </div>
    <div v-if="toast.visible" class="fixed top-5 left-1/2 -translate-x-1/2 bg-gray-800/90 border border-gray-600 text-white text-sm font-semibold py-2 px-5 rounded-lg shadow-lg fade-in z-50">{{ toast.message }}</div>
    <div v-if="isModalVisible" @click="isModalVisible = false" class="modal-overlay fade-in">
        <div @click.stop class="bg-[#1E1E1E] border border-gray-700 rounded-2xl p-6 w-11/12 max-w-sm text-white">
            <h3 class="font-teko text-2xl text-[#E53935] mb-2">{{ modalContent.title }}</h3>
            <p class="text-sm text-gray-300 mb-4">{{ modalContent.description }}</p>
            <button @click="isModalVisible = false" class="w-full bg-[#E53935] font-teko text-lg py-2 rounded-lg">FECHAR</button>
        </div>
    </div>
    <div v-if="isGuideVisible" @click="isGuideVisible = false" class="modal-overlay fade-in">
        <div @click.stop class="bg-[#1E1E1E] border border-gray-700 rounded-2xl p-6 w-11/12 max-w-sm text-white">
            <h3 class="font-teko text-3xl mb-2">Bem-vindo ao Noskill!</h3>
            <div class="text-sm text-gray-300 space-y-3 mb-4">
                <p><strong>Passo 1: Ative o Sistema</strong><br>Toque no botão "OFF" no painel principal para iniciar a otimização.</p>
                <p><strong>Passo 2: Configure as Funções</strong><br>Use o switch para abrir o painel de funções e ativar as otimizações que desejar.</p>
                <p><strong>Passo 3: Inicie o Jogo</strong><br>Com o painel ativo, abra o Free Fire. As otimizações serão injetadas automaticamente.</p>
            </div>
            <button @click="isGuideVisible = false" class="w-full bg-[#E53935] font-teko text-lg py-2 rounded-lg">ENTENDI!</button>
        </div>
    </div>
    <div class="min-h-screen flex items-center justify-center p-4" :class="{'animated-bg': currentScreen === 'dashboard'}">
        <div class="w-full max-w-md mx-auto">
            <section v-if="currentScreen === 'login'" class="fade-in">
                <div class="bg-[#1E1E1E] rounded-2xl text-center">
                    <div class="bg-[#1E1E1E]/80 backdrop-blur-sm rounded-2xl p-8">
                        <img src="https://i.imgur.com/OfdLSLU.png" alt="Noskill Logo" class="w-40 mx-auto mb-4">
                        <h1 class="font-teko text-4xl tracking-wider text-white">ÁREA DE MEMBROS</h1>
                        <p class="text-sm text-gray-400 mb-6">Acesse seu conteúdo exclusivo.</p>
                        <div class="space-y-4 text-left">
                            <div>
                                <label class="text-xs text-gray-400 mb-1 block">Seu Usuário</label>
                                <input type="text" v-model="user.username" class="w-full bg-[#2A2A2A] rounded-lg p-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#E53935]" placeholder="Usuário">
                            </div>
                            <div>
                                <label class="text-xs text-gray-400 mb-1 block">Sua Senha</label>
                                <input type="password" v-model="user.password" class="w-full bg-[#2A2A2A] rounded-lg p-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#E53935]" placeholder="••••••••">
                            </div>
                            <p v-if="loginError" class="text-xs text-red-500 text-center mt-2">{{ loginError }}</p>
                            <button @click="handleLogin" :disabled="isLoggingIn" type="button" class="w-full bg-[#E53935] hover:bg-red-700 font-teko text-xl text-white font-bold py-3 rounded-lg transition-transform hover:scale-105 mt-4 disabled:bg-gray-600 disabled:cursor-not-allowed">
                                {{ isLoggingIn ? 'ENTRANDO...' : 'ENTRAR' }}
                            </button>
                        </div>
                    </div>
                </div>
            </section>
            <section v-if="currentScreen === 'dashboard'" class="fade-in bg-black/30 backdrop-blur-md rounded-2xl p-6 h-[750px] flex flex-col">
                 <header class="flex justify-between items-center relative">
                    <img src="https://i.imgur.com/OfdLSLU.png" alt="Noskill Logo" class="h-8">
                    <button @click="isMenuVisible = !isMenuVisible" class="w-10 h-10 bg-[#E53935] rounded-xl flex items-center justify-center text-white"><i class="fa-solid fa-ellipsis-vertical"></i></button>
                    <div v-if="isMenuVisible" @click="isMenuVisible = false" class="absolute top-12 right-0 bg-[#2A2A2A] rounded-lg shadow-lg w-48 z-20">
                        <a href="#" @click.prevent="showInstallGuide" class="block px-4 py-2 text-sm text-white hover:bg-gray-700">Tela Cheia (Instalar App)</a>
                        <a href="#" @click.prevent="isGuideVisible = true" class="block px-4 py-2 text-sm text-white hover:bg-gray-700">Como Usar?</a>
                        <a href="https://www.instagram.com/noskill.sensi" target="_blank" class="block px-4 py-2 text-sm text-white hover:bg-gray-700">Instagram</a>
                        <a href="#" @click.prevent="logout" class="block px-4 py-2 text-sm text-white hover:bg-gray-700">Sair (Logout)</a>
                    </div>
                 </header>
                <div class="text-center my-6 flex-grow flex flex-col justify-center">
                    <button @click="activateSystem" class="relative w-48 h-48 rounded-full flex items-center justify-center mx-auto">
                        <div class="absolute inset-0 rounded-full border-2" :class="{'border-green-500': isMainToggleOn, 'border-[#E53935]': mainButtonState === 'OFF', 'spinning-border': mainButtonState === 'VERIFICANDO'}"></div>
                        <div class="w-[90%] h-[90%] bg-gray-800 rounded-full flex flex-col items-center justify-center">
                            <span class="font-teko text-6xl" :class="{'text-green-500': isMainToggleOn, 'text-[#E53935]': mainButtonState === 'OFF'}">{{ mainButtonState }}</span>
                            <span class="text-xs text-gray-400 -mt-2">{{ mainButtonSubText }}</span>
                        </div>
                    </button>
                    <div class="grid grid-cols-3 gap-3 mt-8 text-white">
                        <div class="bg-gray-800/50 rounded-lg p-2 text-center"><p class="text-xs text-gray-400">STATUS</p><p class="font-bold text-sm" :class="{'text-green-400': statusCards.protection === 'SEGURO', 'text-red-500': statusCards.protection === 'INATIVO'}">{{ statusCards.protection }}</p></div>
                        <div class="bg-gray-800/50 rounded-lg p-2 text-center"><p class="text-xs text-gray-400">PING</p><p class="font-bold text-sm text-green-400">{{ statusCards.ping }}</p></div>
                        <div class="bg-gray-800/50 rounded-lg p-2 text-center"><p class="text-xs text-gray-400">PERFORMANCE</p><p class="font-bold text-sm" :class="{'text-green-400': statusCards.performance === 'ESTÁVEL'}">{{ statusCards.performance }}</p></div>
                    </div>
                </div>
                <div class="flex items-center gap-4">
                    <div class="w-12 h-12 bg-[#E53935] rounded-xl flex items-center justify-center"><img src="https://i.imgur.com/OfdLSLU.png" alt="Noskill Icon" class="h-6"></div>
                    <div class="flex-1"><p class="font-bold text-sm text-white">Abrir Painel de Funções</p><p class="text-xs text-gray-400">Acesse todas as otimizações</p></div>
                    <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" @change="openPanel" data-panel-toggle class="sr-only peer">
                        <div class="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#E53935]"></div>
                    </label>
                </div>
            </section>
            <section v-if="currentScreen === 'panel'" class="fade-in">
                <div class="bg-[#1E1E1E] rounded-2xl w-full h-[750px] flex overflow-hidden">
                    <nav class="w-20 bg-black/20 flex flex-col items-center py-4 space-y-4">
                        <button @click="changeTab('aim')" class="nav-button w-14 h-14 flex items-center justify-center rounded-xl text-gray-400" :class="{ 'active': activeTab === 'aim' }"><i class="fa-solid fa-crosshairs text-2xl"></i></button>
                        <button @click="changeTab('sensitivity')" class="nav-button w-14 h-14 flex items-center justify-center rounded-xl text-gray-400" :class="{ 'active': activeTab === 'sensitivity' }"><i class="fa-solid fa-sliders text-2xl"></i></button>
                        <button @click="changeTab('optimization')" class="nav-button w-14 h-14 flex items-center justify-center rounded-xl text-gray-400" :class="{ 'active': activeTab === 'optimization' }"><i class="fa-solid fa-bolt text-2xl"></i></button>
                        <button @click="changeTab('special')" class="nav-button w-14 h-14 flex items-center justify-center rounded-xl text-gray-400" :class="{ 'active': activeTab === 'special' }"><i class="fa-solid fa-star text-2xl"></i></button>
                        <button @click="changeTab('ia')" class="nav-button w-14 h-14 flex items-center justify-center rounded-xl text-gray-400" :class="{ 'active': activeTab === 'ia' }"><i class="fa-solid fa-brain text-2xl"></i></button>
                        <div class="flex-grow"></div>
                        <button @click="closePanel" class="w-14 h-14 flex items-center justify-center rounded-xl text-gray-400"><i class="fa-solid fa-arrow-left text-2xl"></i></button>
                    </nav>
                    <main class="flex-1 p-4 overflow-y-auto custom-scrollbar text-white">
                        <div v-if="activeTab === 'aim'" class="panel-page fade-in"><h2 class="bg-[#E53935] inline-block text-sm font-bold text-white p-2 rounded-lg mb-6">Aprimoramento de Mira</h2><div class="space-y-4">
                            <div class="flex items-center"><p class="flex-1 text-sm">Mira Gruda</p><button @click="openModal('miraGruda')" class="text-gray-400 mr-2"><i class="fa-solid fa-info-circle"></i></button><label class="relative inline-flex items-center cursor-pointer"><input type="checkbox" v-model="aimToggles.miraGruda" @change="handleSimpleToggle('Mira Gruda', aimToggles.miraGruda)" class="sr-only peer"><div class="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#E53935]"></div></label></div>
                            <div class="flex items-center"><p class="flex-1 text-sm">Mira Travada (Lock)</p><button @click="openModal('miraLock')" class="text-gray-400 mr-2"><i class="fa-solid fa-info-circle"></i></button><label class="relative inline-flex items-center cursor-pointer"><input type="checkbox" v-model="aimToggles.miraLock" @change="handleSimpleToggle('Mira Lock', aimToggles.miraLock)" class="sr-only peer"><div class="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#E53935]"></div></label></div>
                            <div class="flex items-center"><p class="flex-1 text-sm">Anti-Pinada (Estável)</p><button @click="openModal('antiPinada')" class="text-gray-400 mr-2"><i class="fa-solid fa-info-circle"></i></button><label class="relative inline-flex items-center cursor-pointer"><input type="checkbox" v-model="aimToggles.antiPinada" @change="handleSimpleToggle('Anti-Pinada', aimToggles.antiPinada)" class="sr-only peer"><div class="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#E53935]"></div></label></div>
                            <div class="flex items-center"><p class="flex-1 text-sm">Aim FOV (90°)</p><button @click="openModal('aimFov')" class="text-gray-400 mr-2"><i class="fa-solid fa-info-circle"></i></button><label class="relative inline-flex items-center cursor-pointer"><input type="checkbox" v-model="aimToggles.aimFov" @change="handleSimpleToggle('Aim FOV', aimToggles.aimFov)" class="sr-only peer"><div class="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#E53935]"></div></label></div>
                            <div class="flex items-center"><p class="flex-1 text-sm">Puxada Automática</p><button @click="openModal('puxadaAuto')" class="text-gray-400 mr-2"><i class="fa-solid fa-info-circle"></i></button><label class="relative inline-flex items-center cursor-pointer"><input type="checkbox" v-model="aimToggles.puxadaAuto" @change="handleSimpleToggle('Puxada Automática', aimToggles.puxadaAuto)" class="sr-only peer"><div class="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#E53935]"></div></label></div>
                            <div class="flex items-center"><p class="flex-1 text-sm">Só Capa / Anti-Peito</p><button @click="openModal('soCapa')" class="text-gray-400 mr-2"><i class="fa-solid fa-info-circle"></i></button><label class="relative inline-flex items-center cursor-pointer"><input type="checkbox" v-model="aimToggles.soCapa" @change="handleSimpleToggle('Só Capa', aimToggles.soCapa)" class="sr-only peer"><div class="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#E53935]"></div></label></div>
                        </div></div>
                        <div v-if="activeTab === 'sensitivity'" class="panel-page fade-in">
                            <h2 class="bg-[#E53935] inline-block text-sm font-bold text-white p-2 rounded-lg mb-6">Ajuste de Sensibilidade</h2><div class="space-y-5"><div><div class="flex justify-between items-center mb-1"><label class="text-sm">Geral</label><span class="text-sm font-bold text-[#E53935]">{{ sensitivitySliders.geral }}</span></div><input type="range" min="0" max="120" v-model.number="sensitivitySliders.geral" @change="handleSensitivityChange('Sensibilidade Geral', sensitivitySliders.geral)" class="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#E53935]"></div><div><div class="flex justify-between items-center mb-1"><label class="text-sm">Ponto Vermelho (Red Dot)</label><span class="text-sm font-bold text-[#E53935]">{{ sensitivitySliders.redDot }}</span></div><input type="range" min="0" max="120" v-model.number="sensitivitySliders.redDot" @change="handleSensitivityChange('Red Dot', sensitivitySliders.redDot)" class="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#E53935]"></div><div><div class="flex justify-between items-center mb-1"><label class="text-sm">Mira 2x</label><span class="text-sm font-bold text-[#E53935]">{{ sensitivitySliders.mira2x }}</span></div><input type="range" min="0" max="120" v-model.number="sensitivitySliders.mira2x" @change="handleSensitivityChange('Mira 2x', sensitivitySliders.mira2x)" class="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#E53935]"></div><div><div class="flex justify-between items-center mb-1"><label class="text-sm">Mira 4x</label><span class="text-sm font-bold text-[#E53935]">{{ sensitivitySliders.mira4x }}</span></div><input type="range" min="0" max="120" v-model.number="sensitivitySliders.mira4x" @change="handleSensitivityChange('Mira 4x', sensitivitySliders.mira4x)" class="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#E53935]"></div><div><div class="flex justify-between items-center mb-1"><label class="text-sm">Velocidade do Toque</label><span class="text-sm font-bold text-[#E53935]">{{ sensitivitySliders.velocidadeToque }}</span></div><input type="range" min="0" max="120" v-model.number="sensitivitySliders.velocidadeToque" @change="handleSensitivityChange('Velocidade do Toque', sensitivitySliders.velocidadeToque)" class="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#E53935]"></div></div>
                        </div>
                        <div v-if="activeTab === 'optimization'" class="panel-page fade-in"><h2 class="bg-[#E53935] inline-block text-sm font-bold text-white p-2 rounded-lg mb-6">Otimização do Dispositivo</h2><div class="space-y-4">
                            <div class="flex items-center"><p class="flex-1 text-sm">Otimizar Ping</p><button @click="openModal('otimizarPing')" class="text-gray-400 mr-2"><i class="fa-solid fa-info-circle"></i></button><span class="text-sm font-bold mr-4" :class="isMainToggleOn ? 'text-green-400' : 'text-gray-500'">{{ statusCards.ping }}</span><label class="relative inline-flex items-center cursor-pointer"><input type="checkbox" v-model="optimizationToggles.otimizarPing" class="sr-only peer" disabled><div class="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#E53935]"></div></label></div>
                            <div class="flex items-center"><p class="flex-1 text-sm">Limpar Cache</p><button @click="openModal('limparCache')" class="text-gray-400 mr-2"><i class="fa-solid fa-info-circle"></i></button><label class="relative inline-flex items-center cursor-pointer"><input type="checkbox" v-model="optimizationToggles.limparCache" @change="handleOptimizationToggle('Limpar Cache', optimizationToggles.limparCache)" :disabled="!isMainToggleOn" class="sr-only peer"><div class="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#E53935]"></div></label></div>
                            <div class="flex items-center"><p class="flex-1 text-sm">FPS no Talo</p><button @click="openModal('fpsNoTalo')" class="text-gray-400 mr-2"><i class="fa-solid fa-info-circle"></i></button><label class="relative inline-flex items-center cursor-pointer"><input type="checkbox" v-model="optimizationToggles.fpsNoTalo" @change="handleSimpleToggle('FPS no Talo', optimizationToggles.fpsNoTalo)" :disabled="!isMainToggleOn" class="sr-only peer"><div class="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#E53935]"></div></label></div>
                            <div class="flex items-center"><p class="flex-1 text-sm">Modo Performance</p><button @click="openModal('modoPerformance')" class="text-gray-400 mr-2"><i class="fa-solid fa-info-circle"></i></button><label class="relative inline-flex items-center cursor-pointer"><input type="checkbox" v-model="optimizationToggles.modoPerformance" @change="handleSimpleToggle('Modo Performance', optimizationToggles.modoPerformance)" :disabled="!isMainToggleOn" class="sr-only peer"><div class="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#E53935]"></div></label></div>
                            <div class="flex items-center"><p class="flex-1 text-sm">Anti-Aquecimento</p><button @click="openModal('antiAquecimento')" class="text-gray-400 mr-2"><i class="fa-solid fa-info-circle"></i></button><label class="relative inline-flex items-center cursor-pointer"><input type="checkbox" v-model="optimizationToggles.antiAquecimento" @change="handleSimpleToggle('Anti-Aquecimento', optimizationToggles.antiAquecimento)" :disabled="!isMainToggleOn" class="sr-only peer"><div class="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#E53935]"></div></label></div>
                            <div class="flex items-center"><p class="flex-1 text-sm">Economia de Bateria</p><button @click="openModal('economiaBateria')" class="text-gray-400 mr-2"><i class="fa-solid fa-info-circle"></i></button><label class="relative inline-flex items-center cursor-pointer"><input type="checkbox" v-model="optimizationToggles.economiaBateria" @change="handleSimpleToggle('Economia de Bateria', optimizationToggles.economiaBateria)" :disabled="!isMainToggleOn" class="sr-only peer"><div class="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#E53935]"></div></label></div>
                        </div></div>
                        <div v-if="activeTab === 'special'" class="panel-page fade-in"><h2 class="bg-[#E53935] inline-block text-sm font-bold text-white p-2 rounded-lg mb-6">Funções Especiais</h2><div class="space-y-4">
                            <div class="flex items-center"><p class="flex-1 text-sm">Sem Recuo (No Recoil)</p><button @click="openModal('semRecuo')" class="text-gray-400 mr-2"><i class="fa-solid fa-info-circle"></i></button><label class="relative inline-flex items-center cursor-pointer"><input type="checkbox" v-model="specialToggles.semRecuo" @change="handleSimpleToggle('Sem Recuo', specialToggles.semRecuo)" :disabled="!isMainToggleOn" class="sr-only peer"><div class="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#E53935]"></div></label></div>
                            <div class="flex items-center"><p class="flex-1 text-sm">Toque Suave (Smooth Touch)</p><button @click="openModal('toqueSuave')" class="text-gray-400 mr-2"><i class="fa-solid fa-info-circle"></i></button><label class="relative inline-flex items-center cursor-pointer"><input type="checkbox" v-model="specialToggles.toqueSuave" @change="handleSimpleToggle('Toque Suave', specialToggles.toqueSuave)" :disabled="!isMainToggleOn" class="sr-only peer"><div class="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#E53935]"></div></label></div>
                            <div class="flex items-center"><p class="flex-1 text-sm">Boost IA</p><button @click="openModal('boostIA')" class="text-gray-400 mr-2"><i class="fa-solid fa-info-circle"></i></button><label class="relative inline-flex items-center cursor-pointer"><input type="checkbox" v-model="specialToggles.boostIA" @change="handleSimpleToggle('Boost IA', specialToggles.boostIA)" :disabled="!isMainToggleOn" class="sr-only peer"><div class="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#E53935]"></div></label></div>
                        </div></div>
                        <div v-if="activeTab === 'ia'" class="panel-page fade-in"><h2 class="bg-[#E53935] inline-block text-sm font-bold text-white p-2 rounded-lg mb-6">Análise por IA</h2><div class="space-y-4"><p class="text-xs text-gray-400">Nossa IA irá analisar seu estilo de jogo e modelo de celular para gerar a melhor configuração.</p><div><label class="text-sm font-bold block mb-1">Modelo do Celular</label><input type="text" v-model="iaState.phoneModel" class="w-full bg-black/20 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#E53935]"></div><div><label class="text-sm font-bold block mb-1">Seu Estilo de Jogo</label><input type="text" v-model="iaState.gameStyle" class="w-full bg-black/20 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#E53935]"></div><button @click="runIAAnalysis" :disabled="!isMainToggleOn" class="w-full bg-[#E53935] hover:bg-red-700 font-teko text-xl text-white font-bold py-3 rounded-lg transition-transform hover:scale-105 mt-4 disabled:bg-gray-600 disabled:cursor-not-allowed">Gerar Configuração</button></div></div>
                    </main>
                </div>
            </section>
        </div>
    </div>
    `
};

createApp(App).mount('#app');

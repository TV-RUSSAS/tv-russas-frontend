import { Metadata } from 'next';
import LegalLayout from '../../components/LegalLayout';

export const metadata: Metadata = {
  title: 'Política de Privacidade',
  description: 'Saiba como a TV Russas coleta, usa e protege seus dados pessoais.',
  alternates: { canonical: '/politica-de-privacidade' }
};

export default function PoliticaPrivacidade() {
  return (
    <LegalLayout>
      <h1 className="legal-title">Política de Privacidade</h1>
      
      <div className="legal-content">
        <p>
          A <strong>TV Russas</strong> ("nós", "nosso", "nossa") tem o compromisso com a transparência, a privacidade e a segurança dos dados de seus usuários ("você", "seu", "sua") durante toda a interação com nosso portal. Esta Política de Privacidade foi elaborada para explicar de forma clara e detalhada como coletamos, usamos, armazenamos, compartilhamos e protegemos suas informações pessoais, em estrita conformidade com a Lei Geral de Proteção de Dados Pessoais (LGPD - Lei nº 13.709/2018) e demais legislações aplicáveis.
        </p>
        <p>
          Ao acessar e utilizar as plataformas da TV Russas, você declara ciência e concorda com as práticas descritas neste documento.
        </p>

        <h2>1. Objetivo e Escopo</h2>
        <p>
          Esta política abrange todas as atividades de tratamento de dados pessoais realizadas por meio da navegação no portal TV Russas, no uso de ferramentas interativas como o formulário "Contato", envio de sugestões e mídias pelo canal "Você Repórter", além de eventuais serviços integrados em nossas plataformas digitais.
        </p>

        <h2>2. Definições Importantes</h2>
        <ul>
          <li><strong>Dado Pessoal:</strong> Qualquer informação relacionada a uma pessoa natural identificada ou identificável (ex: nome, e-mail, CPF, endereço IP).</li>
          <li><strong>Titular dos Dados:</strong> Pessoa natural a quem se referem os dados pessoais que são objeto de tratamento (neste caso, você, nosso leitor).</li>
          <li><strong>Tratamento:</strong> Qualquer operação realizada com dados pessoais, como coleta, armazenamento, acesso, compartilhamento e exclusão.</li>
          <li><strong>Controlador:</strong> A TV Russas, a quem competem as decisões referentes ao tratamento de dados pessoais.</li>
        </ul>

        <h2>3. Quais Dados Pessoais Coletamos?</h2>
        <p>A quantidade e o tipo de informação coletada variam de acordo com o seu uso no nosso portal:</p>
        <ul>
          <li><strong>Dados fornecidos voluntariamente por você:</strong> Quando você utiliza o formulário de "Contato" ou "Você Repórter", coletamos Nome, E-mail, Telefone (WhatsApp), a mensagem em si e arquivos de mídia (fotos ou vídeos) que você decidir anexar.</li>
          <li><strong>Dados de Navegação (Coletados Automaticamente):</strong> Quando você acessa nosso site, podemos coletar automaticamente informações como Endereço IP, tipo de navegador, modelo do dispositivo, sistema operacional, páginas visitadas, tempo de permanência, cliques e URLs de referência, por meio de cookies e tecnologias de rastreamento.</li>
        </ul>

        <h2>4. Para Quais Finalidades Utilizamos os Seus Dados?</h2>
        <p>A TV Russas realiza o tratamento de seus dados pessoais apenas para finalidades legítimas, específicas e informadas, tais como:</p>
        <ul>
          <li><strong>Prestação de Serviços Jornalísticos:</strong> Receber, analisar e, se pertinente ao interesse público, publicar relatos e mídias enviadas via "Você Repórter".</li>
          <li><strong>Atendimento ao Usuário:</strong> Responder a dúvidas, reclamações, sugestões e solicitações de suporte enviadas pelo canal de Contato.</li>
          <li><strong>Melhoria Contínua da Plataforma:</strong> Analisar estatísticas de acesso de forma agregada para entender o comportamento da nossa audiência, aprimorar a navegabilidade e otimizar a distribuição do conteúdo jornalístico.</li>
          <li><strong>Segurança e Prevenção à Fraude:</strong> Monitorar atividades suspeitas, proteger o portal contra ataques cibernéticos (usando ferramentas como Cloudflare Turnstile) e garantir um ambiente digital seguro.</li>
          <li><strong>Cumprimento de Obrigações Legais:</strong> Manter registros de acesso a aplicações de internet, conforme exigido pelo Marco Civil da Internet (Lei nº 12.965/2014), e atender a eventuais ordens judiciais.</li>
        </ul>

        <h2>5. A Exceção para Fins Jornalísticos (Art. 4º da LGPD)</h2>
        <p>
          Como um veículo de comunicação, a atividade-fim da TV Russas é levar informação ao público. A LGPD estabelece que suas regras <strong>não se aplicam</strong> ao tratamento de dados realizado para <strong>fins exclusivamente jornalísticos</strong>, com o intuito de proteger a liberdade de imprensa e o sigilo da fonte. No entanto, os dados coletados na operação técnica do site (como navegação e formulários de suporte) seguem rigorosamente os preceitos de segurança detalhados nesta política.
        </p>

        <h2>6. Com Quem Compartilhamos os Seus Dados?</h2>
        <p>A TV Russas não vende, aluga ou comercializa seus dados pessoais. O compartilhamento ocorre apenas quando estritamente necessário, com:</p>
        <ul>
          <li><strong>Provedores de Tecnologia e Infraestrutura:</strong> Empresas que fornecem serviços de hospedagem (Vercel), banco de dados, armazenamento em nuvem para mídias (Cloudinary) e segurança de tráfego, atuando sempre como Operadores e sujeitos a contratos de confidencialidade.</li>
          <li><strong>Autoridades Governamentais e Judiciais:</strong> Para cumprir determinações legais, ordens judiciais ou solicitações de autoridades administrativas competentes.</li>
        </ul>

        <h2>7. Transferência Internacional de Dados</h2>
        <p>
          Alguns dos fornecedores de infraestrutura técnica da TV Russas podem manter servidores em outros países. Nesses casos, garantimos que a transferência ocorra apenas para países ou organismos internacionais que proporcionem grau de proteção de dados adequado ao previsto na LGPD, ou mediante a adoção de garantias e salvaguardas contratuais rigorosas.
        </p>

        <h2>8. Armazenamento e Segurança das Informações</h2>
        <p>
          Adotamos as melhores práticas de mercado e robustas medidas de segurança da informação (técnicas e administrativas) para proteger seus dados contra acessos não autorizados, destruição, perda, alteração ou qualquer forma de tratamento inadequado. Contudo, destacamos que nenhuma plataforma digital é 100% invulnerável a ameaças, embora empreguemos todos os esforços para mitigar quaisquer riscos.
        </p>
        <p>
          Os dados pessoais serão armazenados somente pelo tempo necessário para cumprir as finalidades para as quais foram coletados, respeitando os prazos de retenção estabelecidos por lei.
        </p>

        <h2>9. Uso de Cookies e Tecnologias Semelhantes</h2>
        <p>
          Utilizamos cookies para o funcionamento técnico do site (Cookies Estritamente Necessários) e para compreender como nossos leitores interagem com as notícias (Cookies de Desempenho/Analytics). Você pode configurar seu navegador para bloquear ou alertar sobre esses cookies, mas algumas partes do portal podem não funcionar corretamente se os cookies essenciais forem desativados.
        </p>

        <h2>10. Quais São os Seus Direitos?</h2>
        <p>Em cumprimento à legislação aplicável, a TV Russas garante a você, como titular, o exercício dos seguintes direitos:</p>
        <ul>
          <li>Confirmação da existência de tratamento de seus dados.</li>
          <li>Acesso aos dados mantidos por nós.</li>
          <li>Correção de dados incompletos, inexatos ou desatualizados.</li>
          <li>Anonimização, bloqueio ou eliminação de dados desnecessários, excessivos ou tratados em desconformidade com a lei.</li>
          <li>Revogação do consentimento, nos casos em que o tratamento basear-se exclusivamente nesta hipótese.</li>
        </ul>

        <h2>11. Links para Sites de Terceiros</h2>
        <p>
          Nossas notícias e reportagens podem conter links para sites externos (fontes, parceiros, órgãos públicos). A TV Russas não se responsabiliza pelas práticas de privacidade ou pelo conteúdo desses sites. Recomendamos que você leia as políticas de privacidade de cada site visitado.
        </p>

        <h2>12. Alterações nesta Política</h2>
        <p>
          Estamos em constante aprimoramento. Por isso, a TV Russas reserva-se o direito de alterar esta Política de Privacidade a qualquer momento, visando adaptar-se a novas exigências legais ou evoluções tecnológicas. A versão atualizada sempre constará nesta página, com a respectiva data de modificação.
        </p>

        <h2>13. Contato e Encarregado de Proteção de Dados (DPO)</h2>
        <p>
          Caso você tenha qualquer dúvida sobre esta Política, sobre como tratamos seus dados pessoais, ou deseje exercer seus direitos, entre em contato conosco através de nossos canais oficiais:
        </p>
        <ul>
          <li><strong>Canal de Atendimento:</strong> Acesse a página <a href="/contato">Fale Conosco</a>.</li>
        </ul>
      </div>
    </LegalLayout>
  );
}

import { Metadata } from 'next';
import LegalLayout from '../../components/LegalLayout';

export const metadata: Metadata = {
  title: 'Termos de Uso',
  description: 'Regras de utilização, direitos autorais e políticas do portal TV Russas.',
  alternates: { canonical: '/termos-de-uso' }
};

export default function TermosUso() {
  return (
    <LegalLayout>
      <h1 className="legal-title">Termos e Condições de Uso</h1>
      
      <div className="legal-content">
        <p>
          Bem-vindo(a) ao portal de notícias <strong>TV Russas</strong>. Ao acessar e utilizar este site, você concorda expressamente com os presentes Termos e Condições Gerais de Uso. Caso não concorde com qualquer disposição aqui estabelecida, solicitamos que interrompa imediatamente o acesso e uso das nossas plataformas.
        </p>

        <h2>1. Natureza do Portal e Aceitação</h2>
        <p>
          A TV Russas é um veículo de comunicação jornalística digital voltado à produção, curadoria e distribuição de conteúdo informativo, reportagens, entretenimento e serviços de utilidade pública. Este documento estabelece as regras básicas que regem a sua relação com nosso portal, complementando a nossa <a href="/politica-de-privacidade">Política de Privacidade</a>.
        </p>

        <h2>2. Acesso e Uso do Conteúdo</h2>
        <p>
          O acesso ao portal é, em regra, gratuito e não exige cadastro prévio para a leitura das notícias. O usuário compromete-se a utilizar o site de boa-fé, respeitando a legislação brasileira vigente, a moral, os bons costumes e a ordem pública.
        </p>
        <p>
          <strong>É terminantemente proibido:</strong>
        </p>
        <ul>
          <li>Utilizar o portal para fins ilícitos ou que violem direitos de terceiros.</li>
          <li>Tentar burlar, desativar ou interferir em recursos de segurança do site.</li>
          <li>Realizar atividades de web scraping, mineração de dados, extração massiva ou utilização de bots não autorizados para copiar nosso conteúdo.</li>
          <li>Propagar vírus, malwares ou códigos maliciosos através de nossos formulários (ex: Você Repórter).</li>
        </ul>

        <h2>3. Propriedade Intelectual e Direitos Autorais</h2>
        <p>
          Todo o material disponível na TV Russas — incluindo, mas não se limitando a textos, artigos, fotografias, vídeos, ilustrações, marcas, logotipos, layout e código-fonte — é de titularidade exclusiva da TV Russas ou de seus parceiros e agências de notícias, sendo protegido pelas leis de Direitos Autorais (Lei nº 9.610/1998) e de Propriedade Industrial (Lei nº 9.279/1996).
        </p>
        <p>
          <strong>Regras de Reprodução:</strong> É vedada a reprodução, cópia, distribuição, modificação ou exibição comercial de nosso conteúdo sem prévia e expressa autorização por escrito. O compartilhamento de links de nossas matérias em redes sociais ou por meio de citações com o devido crédito (mencionando a "TV Russas" e inserindo o link original) é permitido e incentivado.
        </p>

        <h2>4. Participação do Leitor: "Você Repórter" e Comentários</h2>
        <p>
          Ao enviar fotos, vídeos, textos ou áudios através da seção <strong>Você Repórter</strong> ou via nossos canais de Contato, o usuário cede à TV Russas, de forma gratuita, irrevogável e não exclusiva, o direito de publicar, editar, reproduzir, traduzir e distribuir esse material em nossas plataformas e redes sociais associadas.
        </p>
        <ul>
          <li><strong>Responsabilidade do Remetente:</strong> Você garante que é o autor legítimo do material enviado ou que possui as autorizações necessárias de terceiros (inclusive de imagem) para cedê-lo à TV Russas.</li>
          <li><strong>Filtro Editorial:</strong> O envio de sugestões não garante sua publicação. A equipe de jornalismo da TV Russas reserva-se o direito de avaliar a relevância jornalística, a veracidade e o interesse público do conteúdo antes de qualquer divulgação.</li>
          <li><strong>Conteúdos Ofensivos:</strong> Não aceitaremos o envio de materiais com teor discriminatório, difamatório, calunioso, obsceno, ilegal ou que incite o ódio e a violência. O usuário que submeter tais conteúdos será responsabilizado cível e criminalmente.</li>
        </ul>

        <h2>5. Isenção de Responsabilidades</h2>
        <p>
          Nossa equipe jornalística pauta-se pelo rigor e pela ética na apuração das informações. No entanto, o portal TV Russas não se responsabiliza por:
        </p>
        <ul>
          <li>Danos decorrentes de indisponibilidade técnica, falhas de conectividade ou instabilidade momentânea dos servidores.</li>
          <li>Ações tomadas por usuários com base exclusiva em reportagens opinativas, colunas ou artigos assinados, cujas opiniões refletem estritamente o pensamento de seus autores, e não necessariamente a posição institucional do veículo.</li>
          <li>Conteúdos, anúncios e políticas de privacidade de sites de terceiros acessados por meio de links externos disponíveis em nossas matérias.</li>
        </ul>

        <h2>6. Modificações dos Termos de Uso</h2>
        <p>
          A TV Russas reserva-se o direito de revisar e atualizar estes Termos de Uso a qualquer tempo, sem aviso prévio. Recomendamos que os usuários acessem esta página periodicamente para se manterem informados sobre eventuais alterações. A continuidade de uso do site após as modificações constituirá a aceitação das novas condições.
        </p>

        <h2>7. Legislação Aplicável e Foro</h2>
        <p>
          Estes Termos de Uso são regidos e interpretados de acordo com as leis da República Federativa do Brasil. Fica eleito o foro da Comarca de Russas, Estado do Ceará, com exclusão de qualquer outro, por mais privilegiado que seja, para dirimir quaisquer controvérsias ou questões originadas da utilização deste portal.
        </p>

        <h2>8. Canais de Contato Institucional</h2>
        <p>
          Para relatar eventuais infrações a estes Termos, solicitações de errata, direitos de resposta ou dúvidas comerciais, entre em contato através de nossa página de <a href="/contato">Atendimento ao Leitor</a>.
        </p>
      </div>
    </LegalLayout>
  );
}

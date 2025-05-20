import React from 'react';
import { Box, SimpleGrid, Text, VStack, useColorModeValue } from '@chakra-ui/react';

interface ConversationStarterProps {
  onSelectPrompt: (prompt: string) => void;
}

const ConversationStarter: React.FC<ConversationStarterProps> = ({ onSelectPrompt }) => {
  // Örnek konuşma başlatıcıları
  const examplePrompts = [
    {
      title: 'ALT_LAS Nedir?',
      description: 'ALT_LAS projesi hakkında genel bilgi al',
      prompt: 'ALT_LAS projesi nedir ve hangi amaçla geliştirilmektedir?'
    },
    {
      title: 'Federe Mesajlaşma',
      description: 'Federe Mesajlaşma Protokolü hakkında bilgi al',
      prompt: 'ALT_LAS\'ın Federe Mesajlaşma Protokolü nedir ve nasıl çalışır?'
    },
    {
      title: 'Bilişsel İletişim',
      description: 'Bilişsel İletişim Platformu hakkında bilgi al',
      prompt: 'Bilişsel İletişim Platformu\'nun özellikleri nelerdir?'
    },
    {
      title: 'Güvenli AI Sandbox',
      description: 'Güvenli AI Sandbox hakkında bilgi al',
      prompt: 'Güvenli AI Sandbox nedir ve neden önemlidir?'
    },
    {
      title: 'Kolektif Zeka',
      description: 'Kolektif Zeka Ağı hakkında bilgi al',
      prompt: 'ALT_LAS\'ın Kolektif Zeka Ağı nasıl çalışır?'
    },
    {
      title: 'Gizlilik ve Güvenlik',
      description: 'Gizlilik ve güvenlik özellikleri hakkında bilgi al',
      prompt: 'ALT_LAS\'ın gizlilik ve güvenlik yaklaşımı nedir?'
    }
  ];

  const cardBg = useColorModeValue('white', 'gray.700');
  const cardHoverBg = useColorModeValue('gray.50', 'gray.600');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  return (
    <Box p={6} textAlign="center">
      <VStack spacing={6} mb={8}>
        <Text fontSize="2xl" fontWeight="bold">
          ALT_LAS Asistan'a Hoş Geldiniz
        </Text>
        <Text color="gray.500">
          ALT_LAS projesi hakkında sorularınızı yanıtlamak için buradayım. Aşağıdaki konulardan birini seçebilir veya kendi sorunuzu yazabilirsiniz.
        </Text>
      </VStack>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
        {examplePrompts.map((item, index) => (
          <Box
            key={index}
            p={4}
            borderRadius="lg"
            border="1px solid"
            borderColor={borderColor}
            bg={cardBg}
            _hover={{
              bg: cardHoverBg,
              transform: 'translateY(-2px)',
              boxShadow: 'md',
              cursor: 'pointer'
            }}
            transition="all 0.2s"
            onClick={() => onSelectPrompt(item.prompt)}
          >
            <Text fontWeight="bold" mb={2}>
              {item.title}
            </Text>
            <Text fontSize="sm" color="gray.500">
              {item.description}
            </Text>
          </Box>
        ))}
      </SimpleGrid>
    </Box>
  );
};

export default ConversationStarter;

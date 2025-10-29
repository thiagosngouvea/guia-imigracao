import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Caminho para o arquivo Master_file
    const masterFilePath = path.join(process.cwd(), 'src', 'utils', 'Master_file');
    
    if (!fs.existsSync(masterFilePath)) {
      return res.status(404).json({ error: 'Master_file not found on server' });
    }

    // Ler arquivo e contar linhas
    const fileContent = fs.readFileSync(masterFilePath, 'utf-8');
    const lines = fileContent.split('\n').filter(line => line.trim().length > 0);
    
    // Informações sobre o arquivo
    const fileStats = fs.statSync(masterFilePath);
    
    // Analisar alguns links para dar contexto
    const sampleLinks = lines.slice(0, 5);
    const hasEB2NIWCases = lines.some(line => 
      line.includes('B5%20-%20Members%20of%20the%20Professions%20holding%20Advanced%20Degrees') ||
      line.includes('Advanced%20Degrees') ||
      line.includes('Exceptional%20Ability')
    );

    return res.status(200).json({
      totalLines: lines.length,
      fileSize: fileStats.size,
      lastModified: fileStats.mtime,
      sampleLinks,
      hasEB2NIWCases,
      description: 'Base de dados oficial do USCIS com casos negados de imigração',
      categories: {
        'B5 - EB2 Advanced Degree': lines.filter(line => 
          line.includes('B5%20-%20Members%20of%20the%20Professions%20holding%20Advanced%20Degrees')
        ).length,
        'Total Cases': lines.length
      }
    });

  } catch (error) {
    console.error('Error reading Master_file:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

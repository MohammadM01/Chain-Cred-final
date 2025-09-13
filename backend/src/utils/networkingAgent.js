const Certificate = require('../models/Certificate');
const User = require('../models/User');
const crypto = require('crypto');

/**
 * AI Networking Agent - Analyzes student credentials and builds skill graphs
 * This service identifies relationships between students based on skills, certificates, and institutes
 * without modifying existing certificate issuance or wallet handling logic.
 */
class NetworkingAgent {
  constructor() {
    this.skillGraph = new Map();
    this.studentConnections = new Map();
  }

  /**
   * Analyze all certificates and build skill graph
   * @returns {Object} Skill graph with student connections and recommendations
   */
  async analyzeCredentials() {
    try {
      console.log('AI Networking Agent: Starting credential analysis...');
      
      // Fetch all certificates with populated user data
      const certificates = await Certificate.find({})
        .populate('studentWallet', 'name role')
        .populate('issuerWallet', 'name role')
        .lean();

      // Also fetch all users to get names
      const users = await User.find({}).lean();
      const userMap = new Map(users.map(user => [user.wallet.toLowerCase(), user]));

      // Build skill graph
      await this.buildSkillGraph(certificates, userMap);
      
      // Generate recommendations
      const recommendations = this.generateRecommendations();
      
      // Build student connections
      const connections = this.buildStudentConnections();

      return {
        success: true,
        data: {
          skillGraph: Object.fromEntries(this.skillGraph),
          studentConnections: connections,
          recommendations: recommendations,
          analysisTimestamp: new Date().toISOString(),
          totalStudents: this.skillGraph.size,
          totalConnections: connections.length
        }
      };
    } catch (error) {
      console.error('Networking Agent Error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Build skill graph from certificates
   * @param {Array} certificates - Array of certificate documents
   * @param {Map} userMap - Map of wallet addresses to user objects
   */
  async buildSkillGraph(certificates, userMap) {
    this.skillGraph.clear();
    
    for (const cert of certificates) {
      const studentWallet = cert.studentWallet;
      const issuerWallet = cert.issuerWallet;
      
      if (!studentWallet || !issuerWallet) continue;

      // Get user names
      const studentUser = userMap.get(studentWallet.toLowerCase());
      const issuerUser = userMap.get(issuerWallet.toLowerCase());

      // Extract skills from certificate metadata or generate based on issuer
      const skills = this.extractSkillsFromCertificate(cert);
      
      // Add to skill graph
      if (!this.skillGraph.has(studentWallet)) {
        this.skillGraph.set(studentWallet, {
          wallet: studentWallet,
          name: studentUser?.name || 'Unknown User',
          role: studentUser?.role || 'unknown',
          skills: new Set(),
          certificates: [],
          institutes: new Set(),
          connections: new Set()
        });
      }

      const studentNode = this.skillGraph.get(studentWallet);
      studentNode.certificates.push(cert.certificateID);
      
      // Add institute with name
      if (issuerUser) {
        studentNode.institutes.add({
          wallet: issuerWallet,
          name: issuerUser.name,
          role: issuerUser.role
        });
      } else {
        studentNode.institutes.add({
          wallet: issuerWallet,
          name: 'Unknown Institute',
          role: 'unknown'
        });
      }
      
      // Add skills
      skills.forEach(skill => studentNode.skills.add(skill));
    }

    // Convert Sets to Arrays for JSON serialization
    for (const [wallet, node] of this.skillGraph) {
      node.skills = Array.from(node.skills);
      node.institutes = Array.from(node.institutes);
      node.connections = Array.from(node.connections);
    }
  }

  /**
   * Extract skills from certificate (AI-powered skill extraction)
   * @param {Object} certificate - Certificate document
   * @returns {Array} Array of skills
   */
  extractSkillsFromCertificate(certificate) {
    const skills = [];
    
    // Extract from file hash pattern (simplified skill inference)
    if (certificate.fileHash) {
      const hash = certificate.fileHash.toLowerCase();
      
      // Pattern-based skill detection (can be enhanced with AI/LLM)
      if (hash.includes('solidity') || hash.includes('blockchain')) {
        skills.push('Blockchain Development');
        skills.push('Solidity');
      }
      if (hash.includes('web3') || hash.includes('dapp')) {
        skills.push('Web3 Development');
        skills.push('DApp Development');
      }
      if (hash.includes('ai') || hash.includes('ml')) {
        skills.push('Artificial Intelligence');
        skills.push('Machine Learning');
      }
      if (hash.includes('frontend') || hash.includes('react')) {
        skills.push('Frontend Development');
        skills.push('React');
      }
      if (hash.includes('backend') || hash.includes('node')) {
        skills.push('Backend Development');
        skills.push('Node.js');
      }
    }

    // Add generic skills based on certificate type
    if (certificate.fileUrl && certificate.fileUrl.includes('.pdf')) {
      skills.push('Document Management');
    }

    // Default skills if none detected
    if (skills.length === 0) {
      skills.push('Professional Development');
      skills.push('Certification');
    }

    return skills;
  }

  /**
   * Generate AI-powered recommendations
   * @returns {Array} Array of recommendations
   */
  generateRecommendations() {
    const recommendations = [];
    const students = Array.from(this.skillGraph.values());

    for (let i = 0; i < students.length; i++) {
      for (let j = i + 1; j < students.length; j++) {
        const studentA = students[i];
        const studentB = students[j];

        // Find common skills
        const commonSkills = studentA.skills.filter(skill => 
          studentB.skills.includes(skill)
        );

        // Find common institutes
        const commonInstitutes = studentA.institutes.filter(instituteA => 
          studentB.institutes.some(instituteB => instituteB.wallet === instituteA.wallet)
        );

        if (commonSkills.length > 0 || commonInstitutes.length > 0) {
          const recommendation = {
            studentA: {
              wallet: studentA.wallet,
              name: studentA.name,
              role: studentA.role
            },
            studentB: {
              wallet: studentB.wallet,
              name: studentB.name,
              role: studentB.role
            },
            commonSkills: commonSkills,
            commonInstitutes: commonInstitutes,
            connectionStrength: this.calculateConnectionStrength(commonSkills, commonInstitutes),
            recommendation: this.generateRecommendationText(studentA, studentB, commonSkills, commonInstitutes)
          };

          recommendations.push(recommendation);
        }
      }
    }

    // Sort by connection strength
    recommendations.sort((a, b) => b.connectionStrength - a.connectionStrength);
    
    return recommendations.slice(0, 20); // Top 20 recommendations
  }

  /**
   * Calculate connection strength between students
   * @param {Array} commonSkills - Common skills between students
   * @param {Array} commonInstitutes - Common institutes between students
   * @returns {number} Connection strength score (0-100)
   */
  calculateConnectionStrength(commonSkills, commonInstitutes) {
    let strength = 0;
    
    // Skills contribute more to connection strength
    strength += commonSkills.length * 25;
    
    // Institutes contribute to connection strength
    strength += commonInstitutes.length * 15;
    
    // Cap at 100
    return Math.min(strength, 100);
  }

  /**
   * Generate human-readable recommendation text
   * @param {Object} studentA - First student
   * @param {Object} studentB - Second student
   * @param {Array} commonSkills - Common skills
   * @param {Array} commonInstitutes - Common institutes
   * @returns {string} Recommendation text
   */
  generateRecommendationText(studentA, studentB, commonSkills, commonInstitutes) {
    let text = `${studentA.name} and ${studentB.name} `;
    
    if (commonSkills.length > 0 && commonInstitutes.length > 0) {
      text += `both have ${commonSkills.join(', ')} certificates from ${commonInstitutes.map(inst => inst.name).join(', ')}.`;
    } else if (commonSkills.length > 0) {
      text += `share similar skills: ${commonSkills.join(', ')}.`;
    } else if (commonInstitutes.length > 0) {
      text += `both attended ${commonInstitutes.map(inst => inst.name).join(', ')}.`;
    }
    
    text += ` Consider connecting for collaboration!`;
    
    return text;
  }

  /**
   * Build student connections graph
   * @returns {Array} Array of student connections
   */
  buildStudentConnections() {
    const connections = [];
    const students = Array.from(this.skillGraph.values());

    for (let i = 0; i < students.length; i++) {
      for (let j = i + 1; j < students.length; j++) {
        const studentA = students[i];
        const studentB = students[j];

        // Find commonalities
        const commonSkills = studentA.skills.filter(skill => 
          studentB.skills.includes(skill)
        );
        const commonInstitutes = studentA.institutes.filter(instituteA => 
          studentB.institutes.some(instituteB => instituteB.wallet === instituteA.wallet)
        );

        if (commonSkills.length > 0 || commonInstitutes.length > 0) {
          connections.push({
            source: {
              wallet: studentA.wallet,
              name: studentA.name,
              role: studentA.role
            },
            target: {
              wallet: studentB.wallet,
              name: studentB.name,
              role: studentB.role
            },
            commonSkills: commonSkills,
            commonInstitutes: commonInstitutes,
            strength: this.calculateConnectionStrength(commonSkills, commonInstitutes),
            connectionType: this.determineConnectionType(commonSkills, commonInstitutes)
          });
        }
      }
    }

    return connections;
  }

  /**
   * Determine the type of connection between students
   * @param {Array} commonSkills - Common skills
   * @param {Array} commonInstitutes - Common institutes
   * @returns {string} Connection type
   */
  determineConnectionType(commonSkills, commonInstitutes) {
    if (commonSkills.length > 0 && commonInstitutes.length > 0) {
      return 'Skill + Institute Match';
    } else if (commonSkills.length > 0) {
      return 'Skill Match';
    } else if (commonInstitutes.length > 0) {
      return 'Institute Match';
    }
    return 'General Connection';
  }

  /**
   * Get networking insights for a specific student
   * @param {string} studentWallet - Student wallet address
   * @returns {Object} Student-specific networking insights
   */
  async getStudentInsights(studentWallet) {
    try {
      const studentNode = this.skillGraph.get(studentWallet);
      
      if (!studentNode) {
        return {
          success: false,
          error: 'Student not found in network'
        };
      }

      // Find students with similar skills
      const similarStudents = Array.from(this.skillGraph.values())
        .filter(student => student.wallet !== studentWallet)
        .map(student => {
          const commonSkills = studentNode.skills.filter(skill => 
            student.skills.includes(skill)
          );
          const commonInstitutes = studentNode.institutes.filter(instituteA => 
            student.institutes.some(instituteB => instituteB.wallet === instituteA.wallet)
          );
          
          return {
            wallet: student.wallet,
            name: student.name,
            role: student.role,
            commonSkills: commonSkills,
            commonInstitutes: commonInstitutes,
            connectionStrength: this.calculateConnectionStrength(commonSkills, commonInstitutes),
            recommendation: this.generateRecommendationText(studentNode, student, commonSkills, commonInstitutes)
          };
        })
        .filter(student => student.connectionStrength > 0)
        .sort((a, b) => b.connectionStrength - a.connectionStrength);

      return {
        success: true,
        data: {
          student: {
            wallet: studentWallet,
            skills: studentNode.skills,
            certificates: studentNode.certificates,
            institutes: studentNode.institutes
          },
          similarStudents: similarStudents.slice(0, 10),
          totalConnections: similarStudents.length,
          topSkills: this.getTopSkills(studentNode.skills)
        }
      };
    } catch (error) {
      console.error('Student Insights Error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get top skills for a student
   * @param {Array} skills - Student skills
   * @returns {Array} Top skills with frequency
   */
  getTopSkills(skills) {
    const skillCount = {};
    skills.forEach(skill => {
      skillCount[skill] = (skillCount[skill] || 0) + 1;
    });
    
    return Object.entries(skillCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([skill, count]) => ({ skill, count }));
  }

  /**
   * Get network statistics
   * @returns {Object} Network statistics
   */
  getNetworkStats() {
    const students = Array.from(this.skillGraph.values());
    const allSkills = new Set();
    const allInstitutes = new Set();
    
    students.forEach(student => {
      student.skills.forEach(skill => allSkills.add(skill));
      student.institutes.forEach(institute => allInstitutes.add(institute));
    });

    return {
      totalStudents: students.length,
      totalSkills: allSkills.size,
      totalInstitutes: allInstitutes.size,
      averageSkillsPerStudent: students.reduce((sum, student) => sum + student.skills.length, 0) / students.length,
      mostCommonSkills: this.getMostCommonSkills(students),
      topInstitutes: this.getTopInstitutes(students)
    };
  }

  /**
   * Get most common skills across all students
   * @param {Array} students - All students
   * @returns {Array} Most common skills
   */
  getMostCommonSkills(students) {
    const skillCount = {};
    
    students.forEach(student => {
      student.skills.forEach(skill => {
        skillCount[skill] = (skillCount[skill] || 0) + 1;
      });
    });
    
    return Object.entries(skillCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([skill, count]) => ({ skill, count }));
  }

  /**
   * Get top institutes by student count
   * @param {Array} students - All students
   * @returns {Array} Top institutes
   */
  getTopInstitutes(students) {
    const instituteCount = {};
    
    students.forEach(student => {
      student.institutes.forEach(institute => {
        instituteCount[institute] = (instituteCount[institute] || 0) + 1;
      });
    });
    
    return Object.entries(instituteCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([institute, count]) => ({ institute, count }));
  }
}

module.exports = NetworkingAgent;

import os
import google.generativeai as genai
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

# --- Main Configuration and Logic ---
# This is the knowledge base for your chatbot. Customize this with your website's specific information.
# The model will use this text to formulate its responses.
WEBSITE_KNOWLEDGE = """
You are a helpful chatbot for CryptoLance, a blockchain-powered freelancing marketplace. Your primary goal is to guide users through the platform's features and provide correct, helpful information about the website.

**About CryptoLance:**
CryptoLance is a secure, transparent freelance marketplace powered by blockchain escrow and smart contracts. It offers fair pay, lower fees, and global talent through decentralized systems. Our mission is to give freelancers and clients a borderless, low-fee marketplace where trust is enforced by code — escrowed milestones, on-chain transparency, and fast payouts.

**Platform Vision:**
A decentralized future where freelancers and clients collaborate without barriers — transparent systems, predictable payouts, and an open marketplace for global talent.

**Core Platform Features:**
- **Blockchain Escrow:** Secure milestone-based payments held in smart contracts
- **Smart Contracts:** Automated payment releases and dispute resolution
- **Zero Platform Fees:** Only pay blockchain gas fees for transactions
- **Global Payments:** Support for major cryptocurrencies (ETH, USDC, USDT, DAI)
- **Reputation System:** On-chain reputation and rating system
- **Decentralized Identity:** Password-free authentication using crypto wallets
- **Instant Payouts:** Automatic payment releases upon milestone completion
- **Dispute Resolution:** Decentralized arbitration system for fair outcomes

**How CryptoLance Works (6 Simple Steps):**

1. **Connect Your Wallet:** Sign in securely using your crypto wallet to establish a decentralized, password-free identity on the blockchain.

2. **Post or Browse Jobs:** Clients can post jobs directly to the blockchain. Freelancers explore and bid on jobs across various categories.

3. **Smart Contract Agreement:** Both parties agree on job terms. A smart contract locks the funds in escrow, ensuring transparency and trust.

4. **Deliver Work & Review:** Freelancer completes and submits the work. The client reviews and approves it through the platform.

5. **Instant Crypto Payment:** Upon approval, the smart contract releases escrowed funds instantly to the freelancer's wallet.

6. **Build Reputation:** Both users gain on-chain reputation. Dispute resolution ensures fair outcomes for all parties.

**Main Website Features:**

**For Clients:**
- **Post Jobs:** Post your crypto/blockchain projects with detailed requirements, budget, and timeline
- **Browse Freelancers:** View freelancer profiles, portfolios, and ratings
- **Manage Projects:** Track project progress, approve milestones, and manage payments
- **Dashboard:** Monitor active jobs, proposals, and spending analytics
- **Smart Contract Management:** Handle milestone payments and project completion

**For Freelancers:**
- **Browse Jobs:** Find and bid on crypto projects that match your skills
- **Create Gigs:** Offer your services with different pricing tiers (Basic, Standard, Pro)
- **Portfolio:** Showcase your work, skills, and experience
- **Proposals:** Submit detailed proposals for jobs you're interested in
- **Reputation Building:** Earn on-chain reputation and ratings

**Supported Categories & Skills:**
- **Web3 Development:** React, Node.js, Web3.js, MetaMask integration
- **Smart Contract Development:** Solidity, Ethereum, Polygon, BSC
- **DeFi Protocol Development:** Yield farming, liquidity pools, DEX development
- **NFT Marketplace Development:** IPFS, OpenSea integration, metadata handling
- **Blockchain Security Auditing:** Smart contract security, penetration testing
- **Mobile Crypto Wallet Development:** React Native, Flutter, blockchain integration
- **Technical Content Writing:** Blockchain documentation, whitepapers, tutorials
- **UI/UX Design for Web3:** Crypto app design, DeFi interface design
- **Backend Development:** Node.js, MongoDB, Express, database design
- **Mobile Development:** Flutter, Firebase, Dart, cross-platform apps

**Pricing Tiers for Gigs:**
- **Basic Package:** Essential services at competitive rates
- **Standard Package:** Enhanced features and faster delivery
- **Pro Package:** Premium services with priority support and custom features

**Freelancer Levels & Badges:**
- **New Seller:** Starting their journey on CryptoLance
- **Level 1 ♦:** Established freelancer with proven track record
- **Level 2 ♦♦:** Experienced professional with high ratings
- **Top Rated Seller ★:** Elite freelancer with exceptional performance
- **Expert Verified:** Verified expertise in their field
- **Rising Talent:** Promising newcomer showing great potential

**Success Metrics & Statistics:**
- **Response Time:** Most freelancers respond within 1-2 hours
- **Success Rate:** Top freelancers maintain 90-98% project completion rate
- **Rating System:** 5-star rating system with detailed reviews
- **Project Completion:** Milestone-based progress tracking
- **Payment Security:** 100% escrow protection for all transactions

**Real User Testimonials:**
- **Sarah Chen (Startup Founder, DeFi Labs):** "CryptoLance revolutionized how we hire developers. The smart contract escrow gave us complete confidence, and we found amazing Web3 talent within days."
- **Marcus Rodriguez (Full-Stack Developer):** "As a freelancer, getting paid instantly after project completion is a game-changer. No more waiting weeks for payments or dealing with payment disputes."
- **Elena Volkov (Product Manager, TechCorp):** "The quality of talent on CryptoLance is exceptional. We've hired 12 developers and designers, all delivering outstanding work with perfect communication."
- **David Kim (Smart Contract Developer):** "CryptoLance's decentralized approach means no platform can freeze my earnings. I have complete control over my work and payments. It's the future of freelancing."

**Smart Contract & Blockchain Features:**
- **HFT Token System:** Platform's native token for governance and rewards
- **Escrow Contracts:** Automated fund locking and release
- **Milestone Payments:** Structured payment releases based on project progress
- **Dispute Resolution:** Decentralized arbitration for fair outcomes
- **Reputation Tracking:** On-chain reputation and rating system
- **Gas Fee Optimization:** Efficient blockchain transactions

**Security & Trust Features:**
- **Multi-Signature Wallets:** Enhanced security for large transactions
- **Audit Trails:** Complete transparency of all platform activities
- **Dispute Resolution:** Neutral arbitration system
- **Fund Protection:** 100% escrow protection for all projects
- **Identity Verification:** Crypto wallet-based authentication

**Clickable Website Links for Easy Navigation:**

**Main Pages:**
- **Home:** [View Home Page](http://localhost:5173/)
- **About:** [About](http://localhost:5173/about)
- **Help & Documentation:** [Help](http://localhost:5173/help)

**Client Features:**
- **Post Job:** [Post New Job](http://localhost:5173/post-job)
- **Browse Jobs:** [Browse Available Jobs](http://localhost:5173/browse-jobs)
- **Client Dashboard:** [Access Dashboard](http://localhost:5173/dashboard)
- **Job Details:** [View Job Details](http://localhost:5173/jobDetails/[job-id])

**Freelancer Features:**
- **Browse Gigs:** [Browse Available Gigs](http://localhost:5173/gigs)
- **Create Gig:** [Create New Gig](http://localhost:5173/create-gig)
- **Edit Gig:** [Edit Your Gig](http://localhost:5173/edit-gig/[gig-id])
- **Gig Details:** [View Gig Details](http://localhost:5173/gig/[gig-id])
- **Portfolio:** [My Portfolio](http://localhost:5173/portfolio/me)
- **Create Portfolio:** [Create Portfolio](http://localhost:5173/portfolioForm)
- **Proposals:** [Submit Proposals](http://localhost:5173/proposal)
- **Freelancer Profile:** [View Profile](http://localhost:5173/freelancer/[freelancer-id])

**Authentication & Wallet:**
- **Wallet Connection:** [Connect Wallet](http://localhost:5173/connect)
- **Authentication:** [Authenticate](http://localhost:5173/authenticate)
- **OTP Verification:** [Verify OTP](http://localhost:5173/otpverification)

**Smart Contract & Blockchain Features:**
- **Claim Tokens:** [Claim HFT Tokens](http://localhost:5173/claimTokens)
- **Purchase Tokens:** [Buy HFT Tokens](http://localhost:5173/purchaseTokens)
- **Create Proposal:** [Create Smart Contract](http://localhost:5173/createProposal)
- **Open Proposal to Bid:** [Open for Bidding](http://localhost:5173/openProposalToBid)
- **Accept Bid:** [Accept Freelancer Bid](http://localhost:5173/acceptBid)
- **Deposit Bid Amount:** [Deposit Funds](http://localhost:5173/depositBidAmount)
- **Place Bid:** [Submit Your Bid](http://localhost:5173/placeBid)
- **Start Work:** [Begin Project](http://localhost:5173/startWork)
- **Pay First Milestone:** [First Payment](http://localhost:5173/payFirstMileStone)
- **Pay Second Milestone:** [Second Payment](http://localhost:5173/paySecondMileStone)
- **Pay Third Milestone:** [Third Payment](http://localhost:5173/payThirdMileStone)
- **Complete Proposal:** [Finish Project](http://localhost:5173/completeProposal)
- **Cancel Proposal:** [Cancel Project](http://localhost:5173/cancelProposal)

**Admin Features:**
- **Admin Dashboard:** [Admin Panel](http://localhost:5173/adminDashboard)

**Help & Support Categories:**
- **Getting Started:** Wallet connection, first job posting, profile creation
- **Payments & Escrow:** Understanding smart contracts, milestone payments
- **Security:** Account protection, best practices, dispute resolution
- **Disputes:** Resolution process, arbitration system
- **Smart Contracts:** Technical details, gas optimization, contract interaction

**Platform Benefits:**
- **For Clients:** Access to global talent, secure payments, transparent processes
- **For Freelancers:** Instant payments, global reach, reputation building
- **For Both:** Lower fees, automated processes, blockchain security

**Instructions:**
- Answer user questions based ONLY on the provided information about CryptoLance
- If users ask about procedures, explain them simply using the platform's features
- Always provide clickable markdown links using the format [Link Text](URL) for easy navigation
- If users ask about features not covered here, politely redirect them to the Help Center
- Maintain a friendly, professional tone that reflects the platform's blockchain focus
- Emphasize the security, transparency, and global nature of the platform
- Use full URLs with https://cryptolance.com/ prefix for all links
- Replace [job-id], [gig-id], and [freelancer-id] with actual IDs when available
- Make sure all links are properly formatted as [Clickable Text](URL) for maximum usability
- Reference real testimonials and success stories when relevant
- Explain the 6-step process when users ask how the platform works
- Highlight the zero platform fees and blockchain security features
"""
def send_message(user_prompt):
    """
    Sends a prompt to the Gemini API and returns the model's response.
    
    Args:
        user_prompt (str): The user's query.
    
    Returns:
        str: The model's generated response, formatted in Markdown with aligned bullet points and clickable links.
    """
    try:
        genai.configure(api_key="AIzaSyD42H1VMFhmFkcXS7MiWhdwaPgmkBmPN1w")
        model = genai.GenerativeModel('gemini-2.5-flash')

        formatting_instructions = """
        Format your response in clean Markdown with:
        - Properly aligned bullet points using '- ' for each item.
        - Consistent indentation for sub-bullets using '  - '.
        - Clickable links in the format [Link Text](URL) using full URLs from the provided knowledge base, especially for actions like posting jobs, placing bids, or getting help.
        - Clear section headers using '## ' for main sections and '### ' for subsections.
        - Avoid extraneous text or misaligned formatting.
        - If the query relates to platform features, procedures, or navigation, include relevant links from the knowledge base (e.g., [Post New Job](https://cryptolance.com/post-job), [Place Your Bid](https://cryptolance.com/placeBid)).
        - If no specific information is available, politely redirect to the Help Center with a clickable link: [Get Help](https://cryptolance.com/help).
        """
        full_prompt = f"{WEBSITE_KNOWLEDGE}\n{formatting_instructions}\nUser: {user_prompt}"

        response = model.generate_content(full_prompt)
        response_text = response.text.strip()
        lines = response_text.split('\n')
        formatted_lines = []
        for line in lines:
            line = line.strip()
            if line.startswith('•') or line.startswith('*'):
                line = '- ' + line[1:].lstrip()
            # Ensure links are correctly formatted
            if '(' in line and 'https://cryptolance.com/' in line:
                if '[Place Your Bid]' in line:
                    parts = line.split(' - ')
                    if len(parts) == 2 and parts[1].startswith('[') and parts[1].endswith(']'):
                        url = parts[0].replace('(', '').replace(')', '')
                        text = parts[1]
                        line = f'{text}({url})'
                elif '[Get Help]' in line:
                    line = line.replace('http://', 'https://')
                # Add fallback to include a link if the query suggests navigation
                elif any(keyword in user_prompt.lower() for keyword in ['how to', 'where to', 'navigate', 'place', 'post', 'bid']):
                    line = f"{line} [Get Help](https://cryptolance.com/help) if you need assistance."
            formatted_lines.append(line)
        formatted_response = '\n'.join(formatted_lines)

        return formatted_response

    except Exception as e:
        print(f"Error in send_message: {e}")
        return """
- Sorry, I'm unable to provide a response right now.
- Please try again or visit [Get Help](https://cryptolance.com/help) for assistance.
"""

# --- Flask API Setup ---
app = Flask(__name__)
CORS(app, resources={r"/chat": {"origins": ["http://localhost:3001", "http://localhost:5173", "http://localhost:5174", "http://localhost:3000"]}})

@app.route('/chat', methods=['POST'])
def chat():
    """
    API endpoint for the chatbot.
    Accepts a POST request with a JSON body containing a 'message' field.
    """
    # Get JSON data from the request
    data = request.get_json()
    user_message = data.get('message')

    # Return an error if no message is provided
    if not user_message:
        return jsonify({"error": "No message provided"}), 400

    # Get the response from the Gemini API using the existing function
    response = send_message(user_message)
    
    # Return the chatbot's response as JSON
    return jsonify({"response": response})

if __name__ == '__main__':
    # Run the Flask app
    app.run(debug=True, host='0.0.0.0', port=5000)
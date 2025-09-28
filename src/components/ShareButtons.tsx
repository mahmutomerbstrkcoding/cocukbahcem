import React, { useState } from 'react';
import { Mail, MessageCircle, Copy, Check, Share2 } from 'lucide-react';

interface ShareButtonsProps {
  title: string;
  description: string;
  url: string;
}

export const ShareButtons: React.FC<ShareButtonsProps> = ({ title, description, url }) => {
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleWhatsAppShare = () => {
    const whatsappText = `${title}\n\n${description}\n\n${url}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(whatsappText)}`;
    window.open(whatsappUrl, '_blank');
    setShowShareMenu(false);
  };

  const handleEmailShare = () => {
    const subject = encodeURIComponent(title);
    const body = encodeURIComponent(`${description}\n\nBu makaleyi okumak için: ${url}`);
    const emailUrl = `mailto:?subject=${subject}&body=${body}`;
    window.location.href = emailUrl;
    setShowShareMenu(false);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url,
        });
        setShowShareMenu(false);
      } catch (error) {
        console.log('Share cancelled or failed:', error);
      }
    } else {
      // If native share is not available, show our custom menu
      setShowShareMenu(!showShareMenu);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleNativeShare}
        className="p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-50 rounded-lg transition-colors"
        title="Paylaş"
      >
        <Share2 className="w-4 h-4" />
      </button>

      {/* Custom share menu for non-native share devices */}
      {showShareMenu && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowShareMenu(false)}
          />

          {/* Share menu */}
          <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
            <div className="p-3">
              <h3 className="font-semibold text-gray-900 mb-3">Paylaş</h3>

              <div className="space-y-2">
                {/* Copy Link */}
                <button
                  onClick={handleCopyLink}
                  className="w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-gray-50 rounded-lg transition-colors"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-500" />
                  )}
                  <span className={copied ? 'text-green-600' : 'text-gray-700'}>
                    {copied ? 'Kopyalandı!' : 'Linki Kopyala'}
                  </span>
                </button>

                {/* WhatsApp */}
                <button
                  onClick={handleWhatsAppShare}
                  className="w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <MessageCircle className="w-4 h-4 text-green-600" />
                  <span className="text-gray-700">WhatsApp'ta Paylaş</span>
                </button>

                {/* Email */}
                <button
                  onClick={handleEmailShare}
                  className="w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <Mail className="w-4 h-4 text-blue-600" />
                  <span className="text-gray-700">E-posta Gönder</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
// /src/components/ui/footer.tsx
const Footer = () => {
  return (
    <footer className="py-4 px-4 border-t border-gray-700 mt-0 bg-[#0a0a23] relative z-10 md:bg-transparent md:border-gray-200">
      <div className="max-w-7xl mx-auto flex justify-center items-center">
        <p className="text-sm text-white md:text-gray-600">
          Made with ❤️ by{" "}
          <a
            href="https://bltasolutions.co.ke"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-300 hover:text-blue-200 font-medium md:text-blue-600 md:hover:text-blue-800"
          >
            BLTA Solutions Limited
          </a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
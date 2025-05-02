interface TestimonialCardProps {
  quote: string;
  authorName: string;
  authorLocation: string;
  authorImage: string;
}

const TestimonialCard = ({
  quote,
  authorName,
  authorLocation,
  authorImage,
}: TestimonialCardProps) => {
  return (
    <div className="bg-charcoal p-8 rounded-sm shadow-lg">
      <svg
        className="h-10 w-10 text-gold mb-6"
        fill="currentColor"
        viewBox="0 0 32 32"
        aria-hidden="true"
      >
        <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
      </svg>
      <p className="mb-6 text-white/90">{quote}</p>
      <div className="flex items-center">
        <div className="flex-shrink-0 mr-4">
          <img
            className="h-12 w-12 rounded-full"
            src={authorImage}
            alt={authorName}
          />
        </div>
        <div>
          <h4 className="font-medium">{authorName}</h4>
          <p className="text-sm text-white/70">{authorLocation}</p>
        </div>
      </div>
    </div>
  );
};

export default TestimonialCard;

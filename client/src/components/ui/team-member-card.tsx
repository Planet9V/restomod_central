interface TeamMemberCardProps {
  name: string;
  position: string;
  image: string;
}

const TeamMemberCard = ({ name, position, image }: TeamMemberCardProps) => {
  return (
    <div className="text-center">
      <div className="w-32 h-32 mx-auto rounded-full overflow-hidden mb-4">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover"
        />
      </div>
      <h4 className="font-medium">{name}</h4>
      <p className="text-sm text-offwhite/70">{position}</p>
    </div>
  );
};

export default TeamMemberCard;

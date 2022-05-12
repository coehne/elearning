import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, AppwriteClass, AppwriteLecture } from "../api/api";

export const ClassCard: React.FC<{ awClass: AppwriteClass }> = ({
  awClass,
}) => {
  const [classImage, setClassImage] = useState<string>("");
  const navigate = useNavigate();
  api.getClassThumbnail(awClass.thumbnailId).then((res) => setClassImage(res));

  return (
    <div className="card w-96 bg-base-100 shadow-xl h-full">
      <figure>
        <img src={classImage} alt="class topic picture" />
      </figure>
      <div className="card-body">
        <h2 className="card-title">{awClass.title}</h2>
        <p>{awClass.description}</p>
        <div className="card-actions justify-end">
          <button
            className="btn btn-primary bg-primary hover:bg-secondary text-black"
            onClick={() => navigate(`/classes/${awClass.$id}`)}
          >
            Jetzt Starten
          </button>
        </div>
      </div>
    </div>
  );
};

export const LectureCard: React.FC<{ awLecture: AppwriteLecture }> = ({
  awLecture,
}) => {
  const navigate = useNavigate();

  return (
    <div className="card w-96 bg-base-100 shadow-xl h-full">
      <div className="card-body">
        <h2 className="card-title">{awLecture.title}</h2>
        <div className="badge badge-primary">{awLecture.exp} XP</div>
        <p>{awLecture.description}</p>
        <div className="card-actions justify-end">
          <button
            className="btn btn-primary bg-primary hover:bg-secondary text-black"
            onClick={() => navigate(`/lectures/${awLecture.$id}`)}
          >
            Jetzt Anschauen
          </button>
        </div>
      </div>
    </div>
  );
};

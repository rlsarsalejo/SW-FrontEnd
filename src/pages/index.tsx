import React, { useState, useEffect, useRef } from 'react';
import GlitterCanvas from '../effects/GlitterEffect'; // Import the GlitterCanvas component

const Modal: React.FC<{ 
    isOpen: boolean; 
    onClose: () => void; 
    onRemove: () => void;
    winner: string;
    timeLeft: number | null;
}> = ({ isOpen, onClose, onRemove, winner, timeLeft }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-5 flex items-center justify-center z-50">
        <div className="bg-white p-8 rounded-lg shadow-xl w-1/2">
          <h2 className="text-2xl font-bold mb-4 bg-red-600 p-5 text-white">Winner Winner Chicken Dinner!</h2>
          <p className="text-3xl mb-6 text-center font-semibold">{winner}</p>
          {timeLeft !== null && (
            <p className="text-xl mb-4 text-center">
              Time left to claim prize: <span className='text-red-600 font-semibold'>{timeLeft}</span> seconds
            </p>
          )}
          <div className="flex justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Close
            </button>
            <button
              onClick={onRemove}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            >
              Remove Name
            </button>
          </div>
        </div>
      </div>
    );
};

const Index: React.FC = () => {
    const [names, setNames] = useState<string[]>([
        "Oliver Smith", "Sophia Johnson", "Liam Williams", "Emma Brown", "Noah Jones",
    ]);
    const [participantCount, setParticipantCount] = useState<number>(names.length);
    const [result, setResult] = useState<string>('');
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [isGlitterActive, setIsGlitterActive] = useState<boolean>(false);
    const [timeLeft, setTimeLeft] = useState<number | null>(null);
    const [apiUrl, setApiUrl] = useState<string>('');
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const idleAnimationRef = useRef<number | null>(null);

    useEffect(() => {
        drawWheel();
        idleSpin();
        return () => {
            if (idleAnimationRef.current !== null) {
                cancelAnimationFrame(idleAnimationRef.current);
            }
        };
    }, [names]);

    useEffect(() => {
        setParticipantCount(names.length);
    }, [names]);

    const generateColors = (count: number): string[] => {
        const baseColors = ['#C40C0C', '#5B99C2', '#059212', '#F4CE14']; // Red, Blue, Green, Yellow
        return Array.from({ length: count }, (_, i) => {
            return baseColors[i % baseColors.length];
        });
    };

    const drawWheel = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
    
        const segments = names.length;
        const colors = generateColors(segments);
        const angle = (2 * Math.PI) / segments;
        const radius = canvas.width / 2;
    
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    
        names.forEach((name, i) => {
            ctx.beginPath();
            ctx.moveTo(radius, radius);
            ctx.arc(radius, radius, radius, i * angle, (i + 1) * angle);
            ctx.lineTo(radius, radius);
            ctx.fillStyle = colors[i];
            ctx.fill();
            ctx.save();
    
            ctx.translate(radius, radius);
            ctx.rotate(i * angle + angle / 2);
    
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#fff';
    
            // Adjust font size based on number of segments and name length
            const maxNameLength = Math.max(...names.map(n => n.length));
            let fontSize;
            if (segments <= 5) {
                fontSize = 30; // Large font for few names
            } else if (segments <= 10) {
                fontSize = 24; // Medium font for a moderate number of names
            } else {
                fontSize = Math.min(20, 300 / segments, 300 / maxNameLength);
            }
            ctx.font = `bold ${fontSize}px Arial`;
    
              // e Determine text radius based on the number of segments
              let textRadius: number;
              if (segments >= 50) {
                  textRadius = radius - 50; // Larger radius for more segments
              } else if (segments >= 20) {
                  textRadius = radius - 70; // Smaller radius for fewer segments
              }
              else if (segments >= 10){
                textRadius = radius - 60; 
              }
               else {
                  textRadius = radius - 95; // Adjust for even fewer segments, if needed
              }
            
            // E Split ang  long names
            const maxLength = 12; // e check ang  Number of letter ay ha e split niya
            if (name.length > maxLength) {
                const words = name.split(' ');
                let firstLine = words[0];
                let secondLine = words.slice(1).join(' ');
    
                // Balance lines if second line is much longer
                if (secondLine.length > firstLine.length + 5) {
                    const midIndex = Math.floor(words.length / 2);
                    firstLine = words.slice(0, midIndex).join(' ');
                    secondLine = words.slice(midIndex).join(' ');
                }
    
                ctx.fillText(firstLine, textRadius, -fontSize / 2);
                ctx.fillText(secondLine, textRadius, fontSize / 2);
            } else {
                ctx.fillText(name, textRadius, 0);
            }
            
            ctx.restore();
        });
    
        ctx.beginPath();
        ctx.arc(radius, radius, radius / 7, 0, 2 * Math.PI);
        ctx.fillStyle = 'white';
        ctx.fill();
    };

    const idleSpin = () => {
        let idleAngle = 0;
        const animate = () => {
            idleAngle += 0.01;
            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.save();
            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.rotate(idleAngle);
            ctx.translate(-canvas.width / 2, -canvas.height / 2);
            drawWheel();
            ctx.restore();
            idleAnimationRef.current = requestAnimationFrame(animate);
        };
        animate();
    };

    const easeOutQuint = (x: number) => {
        return 1 - Math.pow(1 - x, 5);
    };

    const startTimer = () => {
        setTimeLeft(60); // Set initial time to 60 seconds
        const timer = setInterval(() => {
            setTimeLeft((prevTime) => {
                if (prevTime === null || prevTime <= 1) {
                    clearInterval(timer);
                    return null;
                }
                return prevTime - 1;
            });
        }, 1000);
    };

    const spinWheel = () => {
        if (idleAnimationRef.current !== null) {
            cancelAnimationFrame(idleAnimationRef.current);
        }
    
        setTimeLeft(null); // Reset the timer before spinning
        const totalSpinAngle = Math.random() * 360 + 1800;
        const spinDuration = 10000;
        const startTime = performance.now();
    
        const spin = (time: number) => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;
    
            const elapsedTime = time - startTime;
            const progress = Math.min(elapsedTime / spinDuration, 1);
            const easedProgress = easeOutQuint(progress);
    
            const angle = totalSpinAngle * easedProgress;
    
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.save();
            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.rotate((angle * Math.PI) / 180);
            ctx.translate(-canvas.width / 2, -canvas.height / 2);
            drawWheel();
            ctx.restore();
    
            if (progress < 1) {
                requestAnimationFrame(spin);
            } else {
                displayResult(angle);
            }
        };
    
        requestAnimationFrame(spin);
    };

    const displayResult = (angle: number) => {
        const segments = names.length;
        const segmentAngle = 360 / segments;
        const normalizedAngle = (angle % 360 + 360) % 360;
        const arrowAngle = 0;
        const winningSegment = Math.floor(((arrowAngle - normalizedAngle + 360) % 360) / segmentAngle);
        const winner = names[winningSegment];
        setResult(`${winner}`);
        setIsModalOpen(true);
        setIsGlitterActive(true);
        setTimeout(() => setIsGlitterActive(false), 3000);
        startTimer(); // Start the timer when displaying the result
    };

    const removeName = () => {
        setNames(prevNames => prevNames.filter(name => name !== result));
        setIsModalOpen(false);
        setResult('');
        setTimeLeft(null); // Reset the timer when removing a name
    };

    const handleFetchNames = async () => {
      if (!apiUrl) {
        alert("Please enter a URL.");
        return;
    }

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data: any = await response.json(); // Use `any` here to avoid type errors

        console.log("Received data:", data); // For debugging

        // Extract names function
        const extractNames = (obj: any): string[] => {
            let names: string[] = [];
            const nameKeys = ['name', 'fullName', 'userName', 'user_name', 'full_name', 'participant_name'];

            if (Array.isArray(obj)) {
                obj.forEach(item => names = names.concat(extractNames(item)));
            } else if (typeof obj === 'object' && obj !== null) {
                for (let key in obj) {
                    if (nameKeys.includes(key.toLowerCase()) && typeof obj[key] === 'string') {
                        names.push(obj[key]);
                    } else {
                        names = names.concat(extractNames(obj[key]));
                    }
                }
            }
            return names;
        };

        const fetchedNames = extractNames(data);

        if (fetchedNames.length === 0) {
            throw new Error("No valid participants found in the data.");
        }

        setNames(fetchedNames);
        console.log("Extracted names:", fetchedNames); // For debugging
    } catch (error) {
        console.error("Error fetching names:", error);
    }
    };

    return (
        <div className="flex justify-center items-center h-screen bg-gray-100">
           {isGlitterActive && <GlitterCanvas isActive={isGlitterActive} />}
            <div className="relative">
               
                <canvas ref={canvasRef} width="550" height="550" className="rounded-full shadow-lg" />
                <div className="absolute top-1/2 right-0 transform translate-x-full -translate-y-1/2 w-0 h-0 border-t-[20px] rotate-180 mr-2 border-b-[20px] border-l-[30px] border-transparent border-l-gray-700"></div>
            </div>
            <div className="flex flex-col ml-10 w-80 space-y-4">
                <div className="text-xl mb-2 text-center font-semibold">
                    Total Participants: <span className="text-red-600">{participantCount}</span>
                </div>
                <textarea
                    rows={8}
                    className="border p-2 rounded resize-none"
                    value={names.join("\n")}
                    onChange={(e) => setNames(e.target.value.split("\n"))}
                />
                <input 
                    type="text" 
                    placeholder="Enter API URL..." 
                    className="border p-2 rounded" 
                    value={apiUrl} 
                    onChange={(e) => setApiUrl(e.target.value)}
                />
                <button
                    onClick={handleFetchNames}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                >
                    Fetch Names
                </button>
                <button
                    onClick={spinWheel}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                    Spin Wheel
                </button>
            </div>
            <Modal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onRemove={removeName}
                winner={result}
                timeLeft={timeLeft}
            />
        </div>
    );
};

export default Index;

using backend_crud.Data;
using Microsoft.EntityFrameworkCore;


var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddDbContext<AppDbContext>(options =>
options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowSpecificOrigins", policy =>
        policy.WithOrigins("http://localhost:4200",
                           "https://localhost:4200",
                           "http://localhost:8081",
                           "https://localhost:8081",
                           "http://192.168.1.5:8081",
                           "https://192.168.1.5:8081",
                           "http://192.168.1.5:8081",
                           "https://192.168.1.5:7035",
                           "http://localhost:7035",
                           "https://localhost:7035")
              .AllowAnyHeader()
              .AllowAnyMethod());

});
builder.Services.AddControllers();
var app = builder.Build();
app.UseCors("AllowSpecificOrigins");

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
